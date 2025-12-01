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

    window.addEventListener('pageshow', () => {
        const form = document.querySelector('.contact-form');
        if (form) form.reset();
    });

    /* =========================================
       CONFIGURACIÓN Y VARIABLES GLOBALES
       ========================================= */
    // ⚠️ PEGA AQUÍ TU NUEVA URL DE APPS SCRIPT
    const API_URL = "https://script.google.com/macros/s/AKfycbxl-RldBgiqFgM4_TKxkE0pjDPh784vhZgv9UxnA6wD5hzspJYn-nNjLxcFJY0jeEtW/exec";
    
    const WHATSAPP_NUMBER = "525514732501"; 

    let inventario = []; 
    let carrito = [];    

    /* =========================================
       1. CONEXIÓN CON GOOGLE SHEETS
       ========================================= */
    async function cargarInventario() {
        try {
            console.log("Cargando inventario actualizado...");
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error servidor");
            
            const data = await response.json();
            
            // Convertimos datos a números para evitar errores lógicos
            inventario = data.map(prod => ({
                ...prod,
                precio: Number(prod.precio),
                stock: Number(prod.stock)
            }));
            
            console.log("Inventario sincronizado:", inventario);
        } catch (error) {
            console.error("Error cargando inventario:", error);
            // Si falla, no borramos el inventario anterior por seguridad
            if(inventario.length === 0) inventario = []; 
        }
    }
    // Carga inicial
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
                
                // Siempre buscamos en 'inventario' que puede haber sido actualizado tras una compra
                productoActual = inventario.find(p => p.id === idProducto);
                lbCantidad.value = 1;

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
                            btnAgregar.onclick = () => agregarAlCarrito(productoActual, parseInt(lbCantidad.value));
                        } else {
                            btnAgregar.disabled = true;
                            btnAgregar.innerText = "Agotado";
                            btnAgregar.style.backgroundColor = "#ccc";
                        }
                    } else {
                        lbTitulo.innerText = "Producto no encontrado"; 
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
       6. LÓGICA DEL CARRITO
       ========================================= */
    const carritoBtn = document.getElementById('carrito-btn');
    const carritoModal = document.getElementById('modal-carrito');
    const cerrarCarrito = document.querySelector('.cerrar-carrito');
    const listaItems = document.getElementById('lista-items');
    const totalElement = document.getElementById('carrito-total');
    const contadorElement = document.getElementById('carrito-contador');
    const btnPagar = document.getElementById('btn-pagar');

    // Referencias a los nuevos inputs
    const inputNombre = document.getElementById('cliente-nombre');
    const inputTelefono = document.getElementById('cliente-telefono');

    function agregarAlCarrito(producto, cantidadInput) {
        const existe = carrito.find(item => item.id === producto.id);
        
        let cantidadActualEnCarrito = existe ? existe.cantidad : 0;
        
        if ((cantidadActualEnCarrito + cantidadInput) > producto.stock) {
            alert(`Solo hay ${producto.stock} unidades disponibles de este sabor.`);
            return;
        }

        if (existe) {
            existe.cantidad += cantidadInput;
        } else {
            carrito.push({ 
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidadInput 
            });
        }
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
        if(carrito.length === 0) return alert("Tu carrito está vacío.");

        // 1. VALIDACIÓN DE CAMPOS
        const clienteNombre = inputNombre.value.trim();
        const clienteTelefono = inputTelefono.value.trim();

        if (!clienteNombre || !clienteTelefono) {
            alert("Por favor, ingresa tu Nombre y Teléfono para confirmar el pedido.");
            return;
        }

        const textoOriginal = btnPagar.innerText;
        btnPagar.innerText = "Procesando...";
        btnPagar.disabled = true;

        const resumenPedido = carrito.map(item => `${item.cantidad} x ${item.nombre}`).join(", ");
        const totalPagar = document.getElementById('carrito-total').innerText;
        
        // 2. OBJETO DE DATOS (Incluyendo Nombre y Teléfono)
        const orden = {
            fecha: new Date().toLocaleString(),
            detalle: resumenPedido,
            nombre: clienteNombre,     // Para la DB
            telefono: clienteTelefono, // Para la DB
            total: totalPagar,
            items: carrito, 
            accion: "nuevo_pedido" 
        };

        const irAWhatsApp = () => {
            let mensajeWhatsApp = `Hola Miss Palomitas 🍿, soy *${clienteNombre}*.\nQuiero realizar el siguiente pedido:\n\n`;
            carrito.forEach(item => {
                mensajeWhatsApp += `▪️ ${item.cantidad} x ${item.nombre} ($${item.precio * item.cantidad})\n`;
            });
            mensajeWhatsApp += `\n*Total a pagar: $${totalPagar}*`;
            mensajeWhatsApp += `\n\nMis datos de contacto:\nTel: ${clienteTelefono}`;
            mensajeWhatsApp += `\n\nQuedo pendiente para coordinar el pago y la entrega. ¡Gracias!`;

            const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;
            
            // 3. LIMPIEZA INTERNA
            carrito = [];
            actualizarCarritoUI();
            inputNombre.value = '';
            inputTelefono.value = '';
            carritoModal.style.display = 'none';
            
            // 4. ABRIR WHATSAPP EN NUEVA PESTAÑA Y RECARGAR STOCK
            window.open(urlWhatsApp, '_blank');
            
            // 5. RECARGAR INVENTARIO AUTOMÁTICAMENTE (Esto actualiza los stocks sin F5)
            cargarInventario(); 
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(orden)
            });

            // Feedback visual antes de abrir WA
            setTimeout(() => {
                alert("¡Pedido registrado! Abriendo WhatsApp...");
                irAWhatsApp();
            }, 500);

        } catch (error) {
            console.error("Error al enviar pedido:", error);
            alert("Hubo un error de conexión, pero te llevaremos a WhatsApp.");
            irAWhatsApp();
        } finally {
            btnPagar.innerText = textoOriginal;
            btnPagar.disabled = false;
        }
    });
});