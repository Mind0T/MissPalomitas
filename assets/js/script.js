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

    /* =========================================
       CONFIGURACIÓN Y VARIABLES GLOBALES
       ========================================= */
    const API_URL = "https://script.google.com/macros/s/AKfycbxhMsqpYWrri_g8cHLfE7rJHcijcU3Wzxhjh5imYcQ8Jh-f7JkQe2b1oBCwkCs-ZdU-/exec"; 
    const WHATSAPP_NUMBER = "525514732501"; 

    let inventario = []; 
    let carrito = [];    

    /* =========================================
       FUNCIÓN DE UTILIDAD PARA FECHAS
       ========================================= */
    function procesarFecha(fechaInput) {
        if (!fechaInput) return "Sin fecha";
        const partes = fechaInput.split('-');
        const anio = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1; 
        const dia = parseInt(partes[2]);
        const fechaObj = new Date(anio, mes, dia);
        return fechaObj.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    
    /* =========================================
       1. CONEXIÓN CON GOOGLE SHEETS
       ========================================= */
    async function cargarInventario() {
        try {
            console.log("Sincronizando inventario...");
            const response = await fetch(`${API_URL}?nocache=${Date.now()}`);
            if (!response.ok) throw new Error("Error servidor");
            
            const data = await response.json();
            
            inventario = data.map(prod => ({
                ...prod,
                precio: Number(prod.precio),
                stock: Number(prod.stock)
            }));
            
            console.log("Inventario actualizado.");
        } catch (error) {
            console.error("Error cargando inventario:", error);
            if(inventario.length === 0) inventario = []; 
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
       3. LOGICA VIDEO (SCROLL + PUNTOS)
       ========================================= */
    const videoContainer = document.getElementById('video-scroll-container');
    const videoDots = document.querySelectorAll('.video-dot');

    function updateActiveDot() {
        if(!videoContainer) return;
        const scrollPosition = videoContainer.scrollLeft;
        const width = videoContainer.clientWidth;
        const index = Math.round(scrollPosition / width);

        videoDots.forEach((dot, i) => {
            if(i === index) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    if(videoContainer) {
        videoContainer.addEventListener('scroll', updateActiveDot);

        videoDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const width = videoContainer.clientWidth;
                videoContainer.scrollTo({
                    left: width * index,
                    behavior: 'smooth'
                });
            });
        });
    }


    /* =========================================
       4. FILTRO DE SABORES Y GALERÍA INICIAL
       ========================================= */
    const filterBtns = document.querySelectorAll('.filtro-btn');
    const galeriaItems = document.querySelectorAll('.galeria-item');
    const galeriaGrid = document.getElementById('galeria-grid');
    
    let itemsVisibles = []; 
    
    // Iniciar oculto hasta que se pulse un botón
    galeriaGrid.style.display = 'none';

    function applyFilter(category) {
        itemsVisibles = [];
        galeriaItems.forEach(item => {
            if(category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
                itemsVisibles.push(item);
            } else {
                item.style.display = 'none';
            }
        });

        // Mostrar grilla al filtrar
        galeriaGrid.style.display = 'grid';
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.getAttribute('data-filter'));
        });
    });

    /* =========================================
       GESTIÓN HISTORIAL PARA MODALES (BACK BUTTON)
       ========================================= */
    // Esta función maneja que al dar "Atrás" en el celular, se cierre el modal en vez de salir.
    window.addEventListener('popstate', (event) => {
        // Si el usuario da atrás, cerramos todo lo que esté abierto visualmente
        lightbox.style.display = 'none';
        carritoModal.style.display = 'none';
    });

    function abrirModalSeguro(modalElement) {
        // Empujamos un estado al historial para "atrapar" el botón atrás
        history.pushState({ modalOpen: true }, "", window.location.href);
        modalElement.style.display = 'flex';
    }

    function cerrarModalSeguro(modalElement) {
        modalElement.style.display = 'none';
        // Si hay un estado en el historial, vamos atrás para limpiarlo
        // (Esto evita que el usuario tenga que dar atrás dos veces luego)
        if (history.state && history.state.modalOpen) {
            history.back();
        }
    }

    /* =========================================
       5. LIGHTBOX Y NAVEGACIÓN
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-cerrar');
    const lightboxWrapper = document.querySelector('.lightbox-wrapper');
    const prevBtn = document.getElementById('lb-prev');
    const nextBtn = document.getElementById('lb-next');

    const infoPanel = document.createElement('div');
    infoPanel.className = 'info-producto';
    infoPanel.innerHTML = `
        <h2 id="lb-titulo" style="font-family:'Sacramento', cursive; color:#D94A8B;">...</h2>
        <p>Precio: <strong id="lb-precio" style="color:#54C5C3;">$0</strong></p>
        
        <div style="margin: 15px 0;">
            <label style="font-weight:bold; margin-right:5px;">Cantidad:</label>
            <input type="number" id="lb-cantidad" value="1" min="1" max="50" style="width: 60px; padding: 5px; border-radius: 5px; border:1px solid #ccc; text-align:center; font-size:1rem;">
        </div>

        <p style="font-size:0.9rem; color:#666;">Disponibles: <span id="lb-stock">...</span></p>
        <p style="font-size:0.7rem; color:#999; margin-top: 10px;">Imágenes solo ilustrativas</p>
        <button id="btn-agregar-carrito" class="btn-enviar" style="margin-top:15px;">Agregar al Carrito</button>
    `;
    if(lightboxWrapper) lightboxWrapper.appendChild(infoPanel);

    const lbTitulo = document.getElementById('lb-titulo');
    const lbPrecio = document.getElementById('lb-precio');
    const lbStock = document.getElementById('lb-stock');
    const lbCantidad = document.getElementById('lb-cantidad');
    const btnAgregar = document.getElementById('btn-agregar-carrito');
    
    let currentItemIndex = 0; 

    function abrirLightbox(index) {
        if(index < 0 || index >= itemsVisibles.length) return;
        currentItemIndex = index;
        
        const item = itemsVisibles[currentItemIndex];
        const img = item.querySelector('img');
        const idProducto = item.getAttribute('data-id');

        const productoActual = inventario.find(p => p.id === idProducto);
        lbCantidad.value = 1;

        if(img) lightboxImg.src = img.src;
        
        // Usamos la función segura para abrir y gestionar historial
        abrirModalSeguro(lightbox);

        if(productoActual) {
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
            lbTitulo.innerText = "Producto no disponible";
            btnAgregar.disabled = true;
        }
    }

    galeriaItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = itemsVisibles.indexOf(item);
            if(index !== -1) abrirLightbox(index);
        });
    });

    if(prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let newIndex = currentItemIndex - 1;
        if(newIndex < 0) newIndex = itemsVisibles.length - 1; 
        abrirLightboxNoHistory(newIndex); // Navegación interna sin afectar historial
    });

    if(nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let newIndex = currentItemIndex + 1;
        if(newIndex >= itemsVisibles.length) newIndex = 0; 
        abrirLightboxNoHistory(newIndex);
    });

    // Función auxiliar para navegar dentro del lightbox sin pushear historial extra
    function abrirLightboxNoHistory(index) {
        currentItemIndex = index;
        const item = itemsVisibles[currentItemIndex];
        const img = item.querySelector('img');
        const idProducto = item.getAttribute('data-id');
        const productoActual = inventario.find(p => p.id === idProducto);
        
        if(img) lightboxImg.src = img.src;
        
        if(productoActual) {
            lbTitulo.innerText = productoActual.nombre;
            lbPrecio.innerText = `$${productoActual.precio}`;
            lbStock.innerText = productoActual.stock;
            // ... lógica de botones igual ...
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
        }
    }

    const cerrarLightbox = () => cerrarModalSeguro(lightbox);
    closeBtn.addEventListener('click', cerrarLightbox);
    
    // Cerrar al clickear fuera
    lightbox.addEventListener('click', (e) => { 
        if(e.target === lightbox) cerrarLightbox(); 
    });

    /* =========================================
       6. LÓGICA DEL CARRITO
       ========================================= */
    const carritoBtn = document.getElementById('carrito-btn');
    const carritoModal = document.getElementById('modal-carrito');
    const cerrarCarrito = document.querySelector('.cerrar-carrito');
    const cerrarExito = document.getElementById('cerrar-exito');
    
    const modalContenidoCarrito = document.getElementById('modal-carrito-contenido');
    const modalContenidoExito = document.getElementById('modal-exito');

    const listaItems = document.getElementById('lista-items');
    const totalElement = document.getElementById('carrito-total');
    const contadorElement = document.getElementById('carrito-contador');
    const btnPagar = document.getElementById('btn-pagar');

    const inputNombre = document.getElementById('cliente-nombre');
    const inputTelefono = document.getElementById('cliente-telefono');
    const inputFechaEvento = document.getElementById('cliente-fecha-evento'); 
    const btnManualWhatsApp = document.getElementById('btn-manual-whatsapp');

    function agregarAlCarrito(producto, cantidadInput) {
        const existe = carrito.find(item => item.id === producto.id);
        
        let cantidadActualEnCarrito = existe ? existe.cantidad : 0;
        
        if ((cantidadActualEnCarrito + cantidadInput) > producto.stock) {
            alert(`Solo hay ${producto.stock} unidades disponibles. Ya tienes ${cantidadActualEnCarrito} en carrito.`);
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

    function resetModal() {
        // Al cerrar (reset), usamos la función segura si es que fue activada por botón X
        // Pero aquí se llama desde listener directo, así que mejor usar cerrarModalSeguro
        // Sin embargo, esta función se usa para cambiar vistas también.
        
        modalContenidoCarrito.style.display = 'block';
        modalContenidoExito.style.display = 'none';
        
        // Si llamamos a resetModal desde el boton cerrar, aplicamos logica de historial
        cerrarModalSeguro(carritoModal);
        
        btnPagar.innerText = "Confirmar Pedido";
        btnPagar.disabled = false;
    }

    if(carritoBtn) carritoBtn.addEventListener('click', () => {
        modalContenidoCarrito.style.display = 'block';
        modalContenidoExito.style.display = 'none';
        
        btnPagar.innerText = "Confirmar Pedido";
        btnPagar.disabled = false;
        
        // Abrir con seguridad de historial
        abrirModalSeguro(carritoModal);
    });
    
    if(cerrarCarrito) cerrarCarrito.addEventListener('click', resetModal);
    if(cerrarExito) cerrarExito.addEventListener('click', resetModal);
    
    // Cerrar clickeando fuera
    window.addEventListener('click', (e) => { 
        if(e.target === carritoModal) resetModal(); 
    });

    /* =========================================
       7. PROCESAR PEDIDO
       ========================================= */
    if(btnPagar) btnPagar.addEventListener('click', async () => {
        if(carrito.length === 0) return alert("Tu carrito está vacío.");

        const clienteNombre = inputNombre.value.trim();
        const clienteTelefono = inputTelefono.value.trim();
        const clienteFechaEntrega = inputFechaEvento.value; 

        if (!clienteNombre || !clienteTelefono || !clienteFechaEntrega) {
            alert("Por favor, ingresa tu Nombre, Teléfono y la Fecha de Entrega deseada.");
            return;
        }

        const textoOriginal = "Confirmar Pedido";
        btnPagar.innerText = "Verificando stock...";
        btnPagar.disabled = true;

        try {
            await cargarInventario(); 

            let stockInsuficiente = false;
            let mensajeError = "";

            carrito.forEach(itemCarrito => {
                const productoEnDB = inventario.find(p => p.id === itemCarrito.id);
                if (!productoEnDB) {
                    stockInsuficiente = true;
                    mensajeError += `- ${itemCarrito.nombre} ya no existe.\n`;
                } else if (productoEnDB.stock < itemCarrito.cantidad) {
                    stockInsuficiente = true;
                    mensajeError += `- ${itemCarrito.nombre}: Solo quedan ${productoEnDB.stock} (pediste ${itemCarrito.cantidad}).\n`;
                }
            });

            if (stockInsuficiente) {
                alert("Atención! El stock ha cambiado:\n\n" + mensajeError + "\nPor favor ajusta tu pedido.");
                btnPagar.innerText = textoOriginal;
                btnPagar.disabled = false;
                return; 
            }

            const fechaDisplay = procesarFecha(clienteFechaEntrega); 

            const totalPagar = document.getElementById('carrito-total').innerText;
            const resumenPedido = carrito.map(item => `${item.cantidad} x ${item.nombre}`).join(", ");
            
            const orden = {
                fecha: new Date().toLocaleString(),
                detalle: resumenPedido,
                nombre: clienteNombre,
                telefono: clienteTelefono,
                fechaEvento: fechaDisplay, 
                total: totalPagar,
                items: carrito, 
                accion: "nuevo_pedido" 
            };

            let mensajeWhatsApp = `Hola Miss Palomitas, soy *${clienteNombre}*.\nQuiero realizar el siguiente pedido:\n\n`;
            carrito.forEach(item => {
                mensajeWhatsApp += ` - ${item.cantidad} x ${item.nombre} ($${item.precio * item.cantidad})\n`;
            });
            mensajeWhatsApp += `\n*Fecha de Entrega: ${fechaDisplay}*`; 
            mensajeWhatsApp += `\n*Total a pagar: $${totalPagar}*`;
            mensajeWhatsApp += `\n\nMis datos de contacto:\nTel: ${clienteTelefono}`;
            mensajeWhatsApp += `\n\nQuedo pendiente para coordinar el pago y la entrega. Gracias!`;
            
            const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;

            btnPagar.innerText = "Registrando...";
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(orden)
            });

            carrito = [];
            actualizarCarritoUI();
            inputNombre.value = '';
            inputTelefono.value = '';
            inputFechaEvento.value = '';

            modalContenidoCarrito.style.display = 'none';
            modalContenidoExito.style.display = 'block';
            
            btnManualWhatsApp.href = urlWhatsApp;

            cargarInventario();

        } catch (error) {
            console.error("Error al procesar:", error);
            alert("Hubo un error de conexión. Intenta de nuevo.");
            btnPagar.innerText = textoOriginal;
            btnPagar.disabled = false;
        }
    });
    
    /* =========================================
       8. LÓGICA DE BOTONES FLOTANTES
       ========================================= */
    const filtrosWrapper = document.getElementById('filtros-wrapper');
    const saboresSection = document.getElementById('sabores');
    const header = document.querySelector('header');
    
    let isFloating = false;

    window.addEventListener('scroll', () => {
        if (!saboresSection || !filtrosWrapper || !header) return;

        const headerHeight = header.offsetHeight;
        const saboresTop = saboresSection.offsetTop;
        const currentScroll = window.scrollY;

        const offsetActivation = saboresTop - headerHeight;

        if (currentScroll >= offsetActivation) {
            if (!isFloating) {
                filtrosWrapper.classList.add('floating-filters');
                filtrosWrapper.style.top = `${headerHeight}px`;
                isFloating = true;
            }
        } else {
            if (isFloating) {
                filtrosWrapper.classList.remove('floating-filters');
                filtrosWrapper.style.top = 'unset';
                isFloating = false;
            }
        }
    });

});