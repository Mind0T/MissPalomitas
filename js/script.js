document.addEventListener('DOMContentLoaded', function() {
    
    // ---- Lógica para el filtro de la galería ----
    const filtroBotones = document.querySelectorAll('.filtro-btn');
    const galeriaItems = document.querySelectorAll('.galeria-item');
    const galeriaPlaceholder = document.querySelector('.galeria-placeholder');
    let currentCategory = null;
    let currentImages = [];
    let currentImageIndex = 0;

    filtroBotones.forEach(boton => {
        boton.addEventListener('click', () => {
            if (galeriaPlaceholder) {
                galeriaPlaceholder.style.display = 'none';
            }
            filtroBotones.forEach(btn => btn.classList.remove('active'));
            boton.classList.add('active');
            const filtro = boton.getAttribute('data-filter');
            currentCategory = filtro;
            currentImages = [];
            galeriaItems.forEach(item => {
                if (item.getAttribute('data-category') === filtro) {
                    item.style.display = 'grid';
                    if (!item.classList.contains('video-container')) {
                        currentImages.push(item.querySelector('img'));
                    }
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // ---- Lógica para el Lightbox ----
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const cerrarBtn = document.querySelector('.lightbox-cerrar');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const imagenesGaleria = document.querySelectorAll('.galeria-item img');

    imagenesGaleria.forEach((img) => {
        img.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            lightboxImg.src = img.src;
            currentImageIndex = currentImages.findIndex(item => item.src === img.src);
        });
    });

    function showImage(index) {
        if (currentImages.length === 0) return;
        currentImageIndex = (index + currentImages.length) % currentImages.length;
        lightboxImg.src = currentImages[currentImageIndex].src;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentImageIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentImageIndex + 1);
        });
    }

    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }


    // ---- Lógica para el carrusel con fundido ----
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselImages = document.querySelectorAll('.carousel-image');
    const carouselPrevBtn = document.querySelector('.carousel-control.prev');
    const carouselNextBtn = document.querySelector('.carousel-control.next');
    
    let currentIndex = 0;
    let isTransitioning = false;
    let autoSlideInterval;
    const slideDuration = 5000;
    const fadeDuration = 800; 

    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        carouselContainer.classList.add('transitioning');

        setTimeout(() => {
            carouselImages[currentIndex].classList.remove('active');
            currentIndex = (index + carouselImages.length) % carouselImages.length;
            carouselImages[currentIndex].classList.add('active');
            carouselContainer.classList.remove('transitioning');
            isTransitioning = false;
        }, fadeDuration);
        
        resetAutoSlide();
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), slideDuration);
    }

    if (carouselPrevBtn && carouselNextBtn && carouselImages.length > 0) {
        carouselPrevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        carouselNextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        
        carouselImages[0].classList.add('active');
        resetAutoSlide();
    }
});