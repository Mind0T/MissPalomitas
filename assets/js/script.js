document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. CARRUSEL HERO --- */
    const heroImages = document.querySelectorAll('.carousel-image');
    let heroIndex = 0;

    function rotateHero() {
        if(heroImages.length === 0) return;
        heroImages[heroIndex].classList.remove('active');
        heroIndex = (heroIndex + 1) % heroImages.length;
        heroImages[heroIndex].classList.add('active');
    }
    if(heroImages.length > 0) setInterval(rotateHero, 4000);

    /* --- 2. FILTRO DE SABORES --- */
    const filterBtns = document.querySelectorAll('.filtro-btn');
    const galeriaItems = document.querySelectorAll('.galeria-item');

    // Función para aplicar filtro
    function applyFilter(category) {
        galeriaItems.forEach(item => {
            if(category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Inicialización: Aplicar filtro de la categoría activa por defecto
    const initialActiveBtn = document.querySelector('.filtro-btn.active');
    if (initialActiveBtn) {
        applyFilter(initialActiveBtn.getAttribute('data-filter'));
    }

    // Event Listeners para los botones
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const categoria = btn.getAttribute('data-filter');
            applyFilter(categoria);
        });
    });

    /* --- 3. CARRUSEL DE VIDEOS (Puntitos) --- */
    const videos = document.querySelectorAll('.video-slide');
    const dots = document.querySelectorAll('.video-dot');

    function showVideo(index) {
        // Quitar clase active a videos y dots
        videos.forEach(v => v.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        // Activar el seleccionado
        if(videos[index]) videos[index].classList.add('active');
        if(dots[index]) dots[index].classList.add('active');
    }

    // Evento click en los puntitos
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showVideo(index);
        });
    });

    /* --- 4. LIGHTBOX GALERÍA --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-cerrar');

    if(lightbox) {
        galeriaItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if(img) {
                    lightboxImg.src = img.src;
                    lightbox.style.display = 'flex';
                }
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });

        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }
});