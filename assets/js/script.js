document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       CONFIGURACIÓN Y VARIABLES GLOBALES
       ========================================= */
    // ⚠️ TU URL EXACTA (Ya la pegué aquí):
    const API_URL = "https://script.google.com/macros/s/AKfycbzI6QDF1hSByKeNQ3UswkZH8ebJLuXZhx6UBOvNAaRBNj85nhaj-Q7Wb5w7t5slIqzJ/exec";

    let inventario = []; // Datos de stock desde Sheets
    let carrito = [];    // Carrito de compras local

    /* =========================================
       1. CONEXIÓN CON GOOGLE SHEETS
       ========================================= */
    async function cargarInventario() {
        console.log("Intentando conectar con:", API_URL);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            const data = await response.json();
            inventario = data;
            console.log("¡Conexión exitosa! Stock cargado:", inventario);
        } catch (error) {
            console.error("Error cargando DB:", error);
            console.warn("Posible causa: No configuraste permisos como 'Cualquier usuario' en Apps Script.");
            inventario = []; 
        }
    }
    cargarInventario();

    /* =========================================
       2. CARRUSEL HERO
       ========================================= */
    const heroImages = document.querySelectorAll('.carousel-image');
    let heroIndex = 0;
    function rotateHero() {
        if(heroImages.length === 0) return;
        heroImages[heroIndex].classList.remove('active');
        heroIndex = (heroIndex + 1) % heroImages.length;
        heroImages[heroIndex].classList.add('active');
    }
    if(heroImages.length > 0) setInterval(rotateHero, 4000);

    /* =========================================
       3. FILTRO DE SABORES
       ========================================= */
    const filterBtns = document.querySelectorAll('.filtro-btn');
    const galeriaItems = document.querySelectorAll('.galeria-item');

    function applyFilter(category) {
        galeriaItems.forEach(item => {
            if(category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    const initialActiveBtn = document.querySelector('.filtro-btn.active');
    if (initialActiveBtn) {
        applyFilter(initialActiveBtn.getAttribute('data-filter'));
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.getAttribute('data-filter'));
        });
    });

    /* =========================================
       4. CARRUSEL VIDEOS
       ========================================= */
    const videos = document.querySelectorAll('.video-slide');
    const dots = document.querySelectorAll('.video-dot');
    function showVideo(index) {
        videos.forEach(v => v.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        if(videos[index]) videos[index].classList.add('active');
        if(dots[index]) dots[index].classList.add('active');
    }
    dots.forEach((dot, index) => dot.addEventListener('click', () => showVideo(index)));

    /* =========================================
       5. LIGHTBOX Y LÓGICA DE COMPRA
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-cerrar');
    const lightboxWrapper = document.querySelector('.lightbox-wrapper');

    // Panel de Info
    const infoPanel = document.createElement('div');
    infoPanel.className = 'info-producto';
    infoPanel.innerHTML = `
        <h2 id="lb-titulo" style="font-family:'Sacramento', cursive; color:#D94A8B;">Cargando...</h2>
        <p>Precio: <strong id="lb-precio" style="color:#54C5C3;">$0</strong></p>
        <p>Disponibles: <span id="lb-stock">Verificando...</span></p>
        <button id="btn-agregar-carrito" class="btn-enviar" style="margin-top:10px;">Agregar al Carrito</button>
    `;
    if(lightboxWrapper) lightboxWrapper.appendChild(infoPanel);

    const lbTitulo = document.getElementById('lb-titulo');
    const lbPrecio = document.getElementById('lb-precio');
    const lbStock = document.getElementById('lb-stock');
    const btnAgregar = document.getElementById('btn-agregar-carrito');
    let productoActual = null;

    if(lightbox) {
        galeriaItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const idProducto = item.getAttribute('data-id'); 
                
                // Buscar en DB (Coincidencia exacta)
                productoActual = inventario.find(p => p.id === idProducto);

                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.style.display = 'flex';
                    
                    if (productoActual) {
                        lbTitulo.innerText = productoActual.nombre;
                        lbPrecio.innerText = `$${productoActual.precio}`;
                        lbStock.innerText = productoActual.stock;
                        
                        if (productoActual.stock > 0) {
                            btnAgregar.disabled = false;
                            btnAgregar.innerText = "Agregar al Carrito";
                            btnAgregar.style.backgroundColor = "#D94A8B";
                            btnAgregar.onclick = () => agregarAlCarrito(productoActual);
                        } else {
                            btnAgregar.disabled = true;
                            btnAgregar.innerText = "Agotado";
                            btnAgregar.style.backgroundColor = "#ccc";
                        }
                    } else {
                        lbTitulo.innerText = "Producto no encontrado";
                        lbStock.innerText = "Revisa consola (F12)";
                        lbPrecio.innerText = "-";
                        btnAgregar.disabled = true;
                        btnAgregar.style.backgroundColor = "#ccc";
                    }
                }
            });
        });

        const cerrarLightbox = () => lightbox.style.display = 'none';
        closeBtn.addEventListener('click', cerrarLightbox);
        lightbox.addEventListener('click', (e) => { if(e.target === lightbox) cerrarLightbox(); });
    }

    /* =========================================
       6. LÓGICA DEL CARRITO
       ========================================= */
    const carritoBtn = document.getElementById('carrito-btn');
    const carritoModal = document.getElementById('modal-carrito');
    const cerrarCarrito = document.querySelector('.cerrar-carrito');
    const listaItems = document.getElementById('lista-items');
    const totalElement = document.getElementById('carrito-total');
    const contadorElement = document.getElementById('carrito-contador');
    const btnPagar = document.getElementById('btn-pagar');

    function agregarAlCarrito(producto) {
        carrito.push(producto);
        actualizarCarritoUI();
        
        const btn = document.getElementById('btn-agregar-carrito');
        const prevText = btn.innerText;
        btn.innerText = "¡Agregado!";
        setTimeout(() => { 
            if(btn.innerText === "¡Agregado!") btn.innerText = prevText; 
            lightbox.style.display = 'none'; 
        }, 700);
    }

    function actualizarCarritoUI() {
        contadorElement.innerText = carrito.length;
        listaItems.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            listaItems.innerHTML = '<p>Carrito vacío.</p>';
        } else {
            carrito.forEach((prod, index) => {
                total += parseInt(prod.precio);
                const itemDiv = document.createElement('div');
                itemDiv.style.borderBottom = '1px solid #eee';
                itemDiv.style.padding = '10px 0';
                itemDiv.style.display = 'flex';
                itemDiv.style.justifyContent = 'space-between';
                itemDiv.innerHTML = `
                    <span>${prod.nombre}</span>
                    <span>$${prod.precio}</span>
                    <span class="btn-eliminar" data-index="${index}" style="color:red; cursor:pointer; font-weight:bold;">&times;</span>
                `;
                listaItems.appendChild(itemDiv);
            });
        }
        totalElement.innerText = total;

        document.querySelectorAll('.btn-eliminar').forEach(b => {
            b.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                carrito.splice(idx, 1);
                actualizarCarritoUI();
            });
        });
    }

    if(carritoBtn) carritoBtn.addEventListener('click', () => carritoModal.style.display = 'flex');
    if(cerrarCarrito) cerrarCarrito.addEventListener('click', () => carritoModal.style.display = 'none');
    window.addEventListener('click', (e) => { if(e.target === carritoModal) carritoModal.style.display = 'none'; });

    /* =========================================
       7. PROCESAR PAGO (POST A GOOGLE SHEETS)
       ========================================= */
    if(btnPagar) btnPagar.addEventListener('click', async () => {
        if(carrito.length === 0) return alert("Agrega productos primero.");

        btnPagar.innerText = "Procesando...";
        btnPagar.disabled = true;

        let errores = 0;

        // Procesamos cada ítem
        for (const item of carrito) {
            const datosCompra = { id: item.id, cantidad: 1 };
            
            try {
                // 'no-cors' permite enviar datos aunque no podamos leer la respuesta
                await fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(datosCompra)
                });
            } catch (e) {
                console.error("Error comprando:", e);
                errores++;
            }
        }

        if (errores === 0) {
            alert("¡Pedido registrado exitosamente!");
            carrito = [];
            actualizarCarritoUI();
            carritoModal.style.display = 'none';
            cargarInventario(); // Recargar stock real
        } else {
            alert("Hubo un error de conexión.");
        }
        
        btnPagar.innerText = "Confirmar Pedido";
        btnPagar.disabled = false;
    });
});