// --- Loading Screen Control ---
(function() {
    const loader = document.getElementById('loader');
    const body = document.body;
    
    // Tambahkan class loading ke body
    body.classList.add('loading');
    
    // Fungsi untuk menyembunyikan loader
    function hideLoader() {
        // Delay minimal untuk memastikan animasi terlihat
        const minDisplayTime = 1500; // 1.5 detik
        const startTime = Date.now();
        
        function checkAndHide() {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);
            
            setTimeout(() => {
                loader.classList.add('hidden');
                body.classList.remove('loading');
                
                // Hapus loader dari DOM setelah animasi selesai
                setTimeout(() => {
                    if (loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 500);
            }, remainingTime);
        }
        
        // Cek apakah semua resource sudah dimuat
        if (document.readyState === 'complete') {
            checkAndHide();
        } else {
            window.addEventListener('load', checkAndHide);
        }
    }
    
    // Mulai proses hide loader
    hideLoader();
})();

document.addEventListener('DOMContentLoaded', function() {

    // --- Hamburger Menu Toggle ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-menu a").forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));

    // --- Animasi Scroll (Fade In) ---
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // --- Simple Lightbox for Gallery ---
    const galleryItems = document.querySelectorAll('.galeri-item');
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    document.body.appendChild(lightbox);

    galleryItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const img = document.createElement('img');
            img.src = item.href;
            while(lightbox.firstChild) {
                lightbox.removeChild(lightbox.firstChild);
            }
            lightbox.appendChild(img);
            lightbox.classList.add('active');
        });
    });

    lightbox.addEventListener('click', e => {
        if (e.target !== e.currentTarget) return;
        lightbox.classList.remove('active');
    });

    // --- Sort Berita by Date (Terbaru ke Terlama) ---
    function sortBeritaByDate() {
        const beritaGrid = document.querySelector('.berita-grid');
        if (!beritaGrid) return;

        const beritaCards = Array.from(beritaGrid.querySelectorAll('.berita-card'));
        
        // Fungsi untuk mengkonversi tanggal Indonesia ke Date object
        function parseIndonesianDate(dateString) {
            const months = {
                'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3,
                'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7,
                'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
            };

            if (!dateString) return new Date(0);

            const parts = dateString.trim().split(' ');
            if (parts.length !== 3) return new Date(0); // Invalid date

            const day = parseInt(parts[0]);
            const monthName = parts[1];
            const month = months[monthName];
            const year = parseInt(parts[2]);

            if (isNaN(day) || month === undefined || isNaN(year)) {
                return new Date(0); // Invalid date
            }

            return new Date(year, month, day);
        }

        // Urutkan artikel berdasarkan tanggal (terbaru ke terlama)
        beritaCards.sort((a, b) => {
            const dateA = a.querySelector('.berita-date');
            const dateB = b.querySelector('.berita-date');
            
            if (!dateA || !dateB) return 0;

            const dateObjA = parseIndonesianDate(dateA.textContent.trim());
            const dateObjB = parseIndonesianDate(dateB.textContent.trim());

            // Urutkan dari terbaru ke terlama (descending)
            return dateObjB - dateObjA;
        });

        // Hapus semua artikel dari grid
        beritaCards.forEach(card => {
            beritaGrid.removeChild(card);
        });

        // Tambahkan kembali artikel yang sudah diurutkan
        beritaCards.forEach(card => {
            beritaGrid.appendChild(card);
            // Re-observe untuk animasi fade-in
            appearOnScroll.observe(card);
        });
    }

    // Jalankan sorting saat halaman dimuat
    sortBeritaByDate();

    // --- Load YouTube Video Data (Title Only) ---
    async function loadYouTubeVideos() {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        const videoItems = Array.from(videoGrid.querySelectorAll('.video-item'));

        // Fungsi untuk mendapatkan judul video dari YouTube oEmbed API
        async function getVideoTitle(videoId) {
            try {
                const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
                const oEmbedResponse = await fetch(oEmbedUrl);
                
                if (!oEmbedResponse.ok) {
                    throw new Error('Failed to fetch oEmbed data');
                }
                
                const oEmbedData = await oEmbedResponse.json();
                return oEmbedData.title;
            } catch (error) {
                console.error(`Error fetching title for video ${videoId}:`, error);
                return 'Video YouTube';
            }
        }

        // Mengambil judul untuk semua video
        for (const item of videoItems) {
            const videoId = item.getAttribute('data-video-id');
            const iframe = item.querySelector('iframe');
            
            if (videoId && iframe) {
                // URL embed dengan parameter untuk memastikan video bisa diputar langsung
                // enablejsapi=1: Mengaktifkan JavaScript API
                // rel=0: Tidak menampilkan video terkait di akhir
                // modestbranding=1: Mengurangi branding YouTube
                // playsinline=1: Memastikan video bisa diputar inline (untuk mobile)
                const cleanEmbedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`;
                iframe.src = cleanEmbedUrl;
                
                // Ambil judul video
                const title = await getVideoTitle(videoId);
                const titleElement = item.querySelector('.video-title');
                
                if (titleElement) {
                    titleElement.textContent = title;
                }

                // Hapus elemen tanggal jika ada
                const dateElement = item.querySelector('.video-date');
                if (dateElement) {
                    dateElement.remove();
                }

                // Tambahkan delay kecil untuk menghindari rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    // Jalankan loading video data saat halaman dimuat
    loadYouTubeVideos();

});