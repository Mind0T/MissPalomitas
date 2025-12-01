document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       0. UTILERÍAS DE INTERFAZ
       ========================================= */
    const menuToggle = document.querySelector('.menu-toggle');
    const headerRight = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    if(menuToggle && headerRight) {
        menuToggle.addEventListener('click', () => {
            headerRight.classList.toggle('nav-active');
            const icon = menuToggle.querySelector('i');
            if(headerRight.classList.contains('nav-active')){
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(headerRight.classList.contains('nav-active')) {
                headerRight.classList.remove('nav-active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Limpiar formulario al regresar
    window.addEventListener('pageshow', () => {
        const form = document.querySelector('.contact-form');
        if (form) form.reset();
    });

    /* =========================================
       CONFIGURACIÓN Y VARIABLES GLOBALES
       ========================================= */
    // TU NUEVA URL ACTUALIZADA
    const API_URL = "https://script.google.com/macros/s/AKfycbx0E3RIhZcZDL6y-Vv4rnMBT7IYT6O-UAOue5hXJlNYUzBU2X39mObZOCfgvks3Dv7X/exec";
    
    // TU NÚMERO DE WHATSAPP (Con lada 52)
    const WHATSAPP_NUMBER = "525514732501"; 

    let inventario = []; 
    let carrito = [];    

    /* =========================================
       1. CONEXIÓN CON GOOGLE SHEETS
       ========================================= */
    async function cargarInventario() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error servidor");
            const data = await response.json();
            inventario = data;
            console.log("Inventario cargado exitosamente:", inventario);
        } catch (error) {
            console.error("Error cargando inventario:", error);
            // Evitamos que la página rompa si falla la carga
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
    if (initialActiveBtn) applyFilter(initialActiveBtn.getAttribute('data-filter'));

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
       5. LIGHTBOX Y SELECCIÓN DE PRODUCTO
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-cerrar');
    const lightboxWrapper = document.querySelector('.lightbox-wrapper');

    // Panel de información dentro del Lightbox
    const infoPanel = document.createElement('div');
    infoPanel.className = 'info-producto';
    infoPanel.innerHTML = `
        <h2 id="lb-titulo" style="font-family:'Sacramento', cursive; color:#D94A8B;">Cargando...</h2>
        <p>Precio: <strong id="lb-precio" style="color:#54C5C3;">$0</strong></p>
        
        <div style="margin: 15px 0;">
            <label style="font-weight:bold; margin-right:5px;">Cantidad:</label>
            <input type="number" id="lb-cantidad" value="1" min="1" max="50" style="width: 60px; padding: 5px; border-radius: 5px; border:1px solid #ccc; text-align:center; font-size:1rem;">
        </div>

        <p style="font-size:0.9rem; color:#666;">Disponibles: <span id="lb-stock">...</span></p>
        <button id="btn-agregar-carrito" class="btn-enviar" style="margin-top:15px;">Agregar al Carrito</button>
    `;
    if(lightboxWrapper) lightboxWrapper.appendChild(infoPanel);

    const lbTitulo = document.getElementById('lb-titulo');
    const lbPrecio = document.getElementById('lb-precio');
    const lbStock = document.getElementById('lb-stock');
    const lbCantidad = document.getElementById('lb-cantidad');
    const btnAgregar = document.getElementById('btn-agregar-carrito');
    let productoActual = null;

    if(lightbox) {
        galeriaItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const idProducto = item.getAttribute('data-id'); 
                
                // Buscamos el producto en la lista descargada
                productoActual = inventario.find(p => p.id === idProducto);
                lbCantidad.value = 1;

                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.style.display = 'flex';
                    
                    if (productoActual) {
                        lbTitulo.innerText = productoActual.nombre;
                        lbPrecio.innerText = `$${productoActual.precio}`;
                        lbStock.innerText = productoActual.stock;
                        
                        // Lógica de Stock
                        if (parseInt(productoActual.stock) > 0) {
                            btnAgregar.disabled = false;
                            btnAgregar.innerText = "Agregar al Carrito";
                            btnAgregar.style.backgroundColor = "#D94A8B";
                            btnAgregar.onclick = () => agregarAlCarrito(productoActual, parseInt(lbCantidad.value));
                        } else {
                            btnAgregar.disabled = true;
                            btnAgregar.innerText = "Agotado";
                            btnAgregar.style.backgroundColor = "#ccc";
                        }
                    } else {
                        // Si el inventario no ha cargado o no existe el ID
                        lbTitulo.innerText = "Consultando...";
                        lbPrecio.innerText = "-";
                        lbStock.innerText = "-";
                        btnAgregar.disabled = true;
                    }
                }
            });
        });

        const cerrarLightbox = () => lightbox.style.display = 'none';
        closeBtn.addEventListener('click', cerrarLightbox);
        lightbox.addEventListener('click', (e) => { if(e.target === lightbox) cerrarLightbox(); });
    }

    /* =========================================
       6. LÓGICA DEL CARRITO (AGRUPACIÓN)
       ========================================= */
    const carritoBtn = document.getElementById('carrito-btn');
    const carritoModal = document.getElementById('modal-carrito');
    const cerrarCarrito = document.querySelector('.cerrar-carrito');
    const listaItems = document.getElementById('lista-items');
    const totalElement = document.getElementById('carrito-total');
    const contadorElement = document.getElementById('carrito-contador');
    const btnPagar = document.getElementById('btn-pagar');

    function agregarAlCarrito(producto, cantidadInput) {
        // Buscamos si ya existe para sumar cantidad
        const existe = carrito.find(item => item.id === producto.id);

        if (existe) {
            existe.cantidad += cantidadInput;
        } else {
            carrito.push({ ...producto, cantidad: cantidadInput });
        }

        actualizarCarritoUI();
        
        // Feedback visual
        const btn = document.getElementById('btn-agregar-carrito');
        const prevText = btn.innerText;
        btn.innerText = "¡Agregado!";
        setTimeout(() => { 
            if(btn.innerText === "¡Agregado!") btn.innerText = prevText; 
            lightbox.style.display = 'none'; 
        }, 700);
    }

    function actualizarCarritoUI() {
        // Sumamos cantidades totales para el globito rojo
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contadorElement.innerText = totalItems;
        
        listaItems.innerHTML = '';
        let totalDinero = 0;

        if (carrito.length === 0) {
            listaItems.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            carrito.forEach((prod, index) => {
                const subtotal = prod.precio * prod.cantidad;
                totalDinero += subtotal;
                
                const itemDiv = document.createElement('div');
                itemDiv.style.borderBottom = '1px solid #eee';
                itemDiv.style.padding = '10px 0';
                itemDiv.style.display = 'flex';
                itemDiv.style.justifyContent = 'space-between';
                itemDiv.style.alignItems = 'center';
                
                itemDiv.innerHTML = `
                    <div style="text-align:left;">
                        <strong style="color:#D94A8B;">${prod.cantidad} x</strong> ${prod.nombre}
                    </div>
                    <div>
                        <span>$${subtotal}</span>
                        <span class="btn-eliminar" data-index="${index}" style="color:red; cursor:pointer; font-weight:bold; margin-left:10px; font-size:1.2rem;">&times;</span>
                    </div>
                `;
                listaItems.appendChild(itemDiv);
            });
        }
        totalElement.innerText = totalDinero;

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
       7. PROCESAR PEDIDO (DB + WHATSAPP)
       ========================================= */
    if(btnPagar) btnPagar.addEventListener('click', async () => {
        if(carrito.length === 0) return alert("Agrega productos primero.");

        btnPagar.innerText = "Procesando...";
        btnPagar.disabled = true;

        // Preparamos los datos
        const resumenPedido = carrito.map(item => `${item.cantidad} x ${item.nombre}`).join(", ");
        const totalPagar = document.getElementById('carrito-total').innerText;
        
        const orden = {
            fecha: new Date().toLocaleString(),
            detalle: resumenPedido,
            total: totalPagar,
            accion: "nuevo_pedido" 
        };

        // Función para abrir WhatsApp
        const abrirWhatsApp = () => {
            let mensajeWhatsApp = `Hola Miss Palomitas 🍿, quiero realizar el siguiente pedido:\n\n`;
            carrito.forEach(item => {
                mensajeWhatsApp += `▪️ ${item.cantidad} x ${item.nombre} ($${item.precio * item.cantidad})\n`;
            });
            mensajeWhatsApp += `\n*Total a pagar: $${totalPagar}*`;
            mensajeWhatsApp += `\n\nQuedo pendiente para coordinar el pago y la entrega. ¡Gracias!`;

            const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;
            
            // Abrimos WhatsApp y recargamos
            window.open(urlWhatsApp, '_blank');
            window.location.reload();
        };

        try {
            // Intentamos guardar en Google Sheets
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(orden)
            });
            
            alert("¡Pedido registrado! Te llevamos a WhatsApp.");
            abrirWhatsApp();

        } catch (error) {
            console.error("Error al registrar en BD:", error);
            // Si falla la BD, igual abrimos WhatsApp para no perder la venta
            alert("Te llevamos a WhatsApp para finalizar tu pedido.");
            abrirWhatsApp();
        }
    });
});