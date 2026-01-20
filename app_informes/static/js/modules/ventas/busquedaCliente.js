// ============================================
// BUSQUEDA CLIENTE.JS - Componente reutilizable
// ============================================
(function() {
    'use strict';

    console.log('🔍 Cargando busquedaCliente.js');

    // Callback que será ejecutado cuando se seleccione un cliente
    let onClienteSeleccionado = null;
    let tipoBusquedaActual = 'codigo';

    /**
     * Inicializar el componente de búsqueda con un callback
     * @param {Function} callback - Función a ejecutar cuando se seleccione un cliente
     */
    function iniciarBusquedaCliente(callback) {
        onClienteSeleccionado = callback;

        // Inicializar eventos si no están inicializados
        inicializarEventosBusqueda();

        // Resetear y mostrar búsqueda
        resetearBusqueda();
    }

    /**
     * Inicializar eventos del componente (solo una vez)
     */
    let eventosInicializados = false;
    function inicializarEventosBusqueda() {
        if (eventosInicializados) return;

        const btnBuscar = document.getElementById('btnBuscar');
        const inputBusqueda = document.getElementById('inputBusqueda');
        const radios = document.querySelectorAll('input[name="tipoBusqueda"]');

        if (btnBuscar) {
            btnBuscar.addEventListener('click', ejecutarBusqueda);
        }

        if (inputBusqueda) {
            inputBusqueda.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') ejecutarBusqueda();
            });
        }

        radios.forEach(radio => {
            radio.addEventListener('change', cambiarTipoBusqueda);
        });

        eventosInicializados = true;
        console.log('✅ Eventos de búsqueda inicializados');
    }

    /**
     * Cambiar tipo de búsqueda (código/descripción)
     */
    function cambiarTipoBusqueda(e) {
        tipoBusquedaActual = e.target.value;
        const label = document.getElementById('labelBusqueda');
        const input = document.getElementById('inputBusqueda');

        if (tipoBusquedaActual === 'codigo') {
            label.textContent = 'Código del cliente:';
            input.placeholder = 'Ingrese el código';
        } else {
            label.textContent = 'Descripción (Razón Social):';
            input.placeholder = 'Ingrese la descripción';
        }

        input.value = '';
        ocultarErrorBusqueda();
    }

    /**
     * Resetear el componente de búsqueda
     */
    function resetearBusqueda() {
        const input = document.getElementById('inputBusqueda');
        const radioCodigo = document.getElementById('radioCodigo');

        if (input) input.value = '';
        if (radioCodigo) {
            radioCodigo.checked = true;
            tipoBusquedaActual = 'codigo';
            cambiarTipoBusqueda({ target: { value: 'codigo' } });
        }

        // Mostrar sección de búsqueda
        mostrarSeccion('busqueda');
        ocultarErrorBusqueda();
    }

    /**
     * Mostrar/ocultar secciones
     */
    function mostrarSeccion(seccion) {
        const seccionBusqueda = document.getElementById('seccionBusqueda');
        const loadingBusqueda = document.getElementById('loadingBusqueda');
        const listaResultados = document.getElementById('listaResultados');
        const seccionInformacion = document.getElementById('seccionInformacion');

        // Ocultar todo primero
        if (seccionBusqueda) seccionBusqueda.classList.add('d-none');
        if (loadingBusqueda) loadingBusqueda.classList.add('d-none');
        if (listaResultados) listaResultados.classList.add('d-none');
        if (seccionInformacion) seccionInformacion.classList.add('d-none');

        switch(seccion) {
            case 'busqueda':
                if (seccionBusqueda) seccionBusqueda.classList.remove('d-none');
                break;
            case 'loading':
                if (seccionBusqueda) seccionBusqueda.classList.remove('d-none');
                if (loadingBusqueda) loadingBusqueda.classList.remove('d-none');
                break;
            case 'lista':
                if (seccionBusqueda) seccionBusqueda.classList.remove('d-none');
                if (listaResultados) listaResultados.classList.remove('d-none');
                break;
            case 'informacion':
                if (seccionInformacion) seccionInformacion.classList.remove('d-none');
                break;
        }
    }

    /**
     * Ejecutar búsqueda según tipo seleccionado
     */
    function ejecutarBusqueda() {
        const input = document.getElementById('inputBusqueda').value.trim();

        if (!input) {
            mostrarErrorBusqueda('Debe ingresar un valor para buscar');
            return;
        }

        ocultarErrorBusqueda();
        mostrarSeccion('loading');

        let promesaBusqueda;

        if (tipoBusquedaActual === 'codigo') {
            promesaBusqueda = buscarPorCodigo(input);
        } else {
            promesaBusqueda = buscarPorDescripcion(input);
        }

        promesaBusqueda.catch(err => {
            console.error('❌ Error en búsqueda:', err);
            mostrarSeccion('busqueda');
            mostrarErrorBusqueda(err.message || 'Error al buscar');
        });
    }

    /**
     * Buscar cliente por código
     */
    function buscarPorCodigo(codigo) {
        return fetch(`/ventas/buscar-codigo/?codigo=${encodeURIComponent(codigo)}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Error en la búsqueda');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('📦 Datos cliente recibidos:', data);

                if (data.CLIENTE) {
                    // Cliente encontrado, ejecutar callback
                    if (onClienteSeleccionado) {
                        onClienteSeleccionado(data.CLIENTE);
                    }
                } else {
                    // No se encontró cliente
                    mostrarSeccion('busqueda');
                    mostrarErrorBusqueda(data.Mensaje || 'No se encontró el cliente');
                }

                return data;
            });
    }

    /**
     * Buscar clientes por descripción
     */
    function buscarPorDescripcion(descripcion) {
        return fetch(`/ventas/buscar-descripcion/?descripcion=${encodeURIComponent(descripcion)}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Error en la búsqueda');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('📦 Datos clientes recibidos:', data);

                if (data.CLIENTES && data.CLIENTES.length > 0) {
                    if (data.CLIENTES.length === 1) {
                        // Un solo resultado, seleccionar directamente
                        seleccionarClienteDeLista(data.CLIENTES[0].codigo);
                    } else {
                        // Múltiples resultados, mostrar lista
                        mostrarListaClientes(data.CLIENTES);
                    }
                } else {
                    mostrarSeccion('busqueda');
                    mostrarErrorBusqueda(data.Mensaje || 'No se encontraron clientes');
                }

                return data;
            });
    }

    /**
     * Mostrar lista de clientes para seleccionar
     */
    function mostrarListaClientes(clientes) {
        const container = document.getElementById('listaClientesContainer');
        container.innerHTML = '';

        clientes.forEach(cliente => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action cliente-item';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="cliente-codigo">${cliente.codigo || '-'}</span>
                        <span class="cliente-nombre ms-2">${cliente.razonSocial || 'Sin nombre'}</span>
                    </div>
                    <i class="fas fa-chevron-right text-muted"></i>
                </div>
            `;

            item.addEventListener('click', () => {
                seleccionarClienteDeLista(cliente.codigo);
            });

            container.appendChild(item);
        });

        mostrarSeccion('lista');
    }

    /**
     * Seleccionar un cliente de la lista (buscar info completa)
     */
    function seleccionarClienteDeLista(codigo) {
        mostrarSeccion('loading');
        buscarPorCodigo(codigo);
    }

    /**
     * Mostrar error de búsqueda
     */
    function mostrarErrorBusqueda(mensaje) {
        const errorEl = document.getElementById('errorBusqueda');
        const mensajeEl = document.getElementById('errorBusquedaMensaje');

        if (mensajeEl) mensajeEl.textContent = mensaje;
        if (errorEl) errorEl.classList.remove('d-none');
    }

    /**
     * Ocultar error de búsqueda
     */
    function ocultarErrorBusqueda() {
        const errorEl = document.getElementById('errorBusqueda');
        if (errorEl) errorEl.classList.add('d-none');
    }

    /**
     * Volver a mostrar la búsqueda (para usar desde otros módulos)
     */
    function volverABusqueda() {
        mostrarSeccion('busqueda');
    }

    // Exponer funciones globalmente
    window.iniciarBusquedaCliente = iniciarBusquedaCliente;
    window.volverABusqueda = volverABusqueda;
    window.mostrarSeccionCliente = mostrarSeccion;

    console.log('✅ busquedaCliente.js cargado');
})();
