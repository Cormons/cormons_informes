// ============================================
// CARGA PEDIDOS.JS - Wizard de carga de pedido
// ============================================
(function() {
    'use strict';

    console.log('📦 Cargando cargaPedidos.js');

    // ============================================
    // ESTADO DEL WIZARD
    // ============================================

    let modalCargarPedido = null;
    let tipoBusquedaPedido = 'codigo';

    // Estado central del pedido (persiste entre pasos)
    const estadoPedido = {
        pasoActual: 1,
        totalPasos: 4,
        cliente: null,
        listaPrecio: null,
        productos: [],
        observaciones: ''
    };

    // Configuracion de cada paso
    const configPasos = {
        1: {
            titulo: 'Seleccionar Cliente',
            validar: () => estadoPedido.cliente !== null,
            alEntrar: inicializarPaso1,
            alSalir: null
        },
        2: {
            titulo: 'Seleccionar Lista de Precio',
            validar: () => true,
            alEntrar: null,
            alSalir: null
        },
        3: {
            titulo: 'Cargar Productos',
            validar: () => true,
            alEntrar: null,
            alSalir: null
        },
        4: {
            titulo: 'Resumen del Pedido',
            validar: () => true,
            alEntrar: null,
            alSalir: null
        }
    };

    // ============================================
    // INICIALIZACION
    // ============================================

    function inicializarModalCargarPedido() {
        const modalElement = document.getElementById('modalCargarPedido');
        if (modalElement && window.bootstrap) {
            modalCargarPedido = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });

            // Eventos de navegacion
            document.getElementById('btnWizardAtras').addEventListener('click', irPasoAnterior);
            document.getElementById('btnWizardSiguiente').addEventListener('click', irPasoSiguiente);

            // Evento para boton "Cambiar cliente"
            document.getElementById('btnCambiarCliente').addEventListener('click', cambiarCliente);

            // Evento al cerrar modal: resetear estado
            modalElement.addEventListener('hidden.bs.modal', resetearWizard);

            // Inicializar eventos de busqueda de cliente
            inicializarBusquedaClientePedido();

            console.log('✅ Modal de cargar pedido inicializado');
        }
    }

    // ============================================
    // BUSQUEDA DE CLIENTE (INDEPENDIENTE)
    // ============================================

    function inicializarBusquedaClientePedido() {
        const btnBuscar = document.getElementById('pedidoBtnBuscar');
        const inputBusqueda = document.getElementById('pedidoInputBusqueda');
        const radioCodigo = document.getElementById('pedidoRadioCodigo');
        const radioDescripcion = document.getElementById('pedidoRadioDescripcion');

        if (btnBuscar) {
            btnBuscar.addEventListener('click', ejecutarBusquedaPedido);
        }

        if (inputBusqueda) {
            inputBusqueda.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') ejecutarBusquedaPedido();
            });
        }

        if (radioCodigo) {
            radioCodigo.addEventListener('change', function() {
                cambiarTipoBusquedaPedido('codigo');
            });
        }

        if (radioDescripcion) {
            radioDescripcion.addEventListener('change', function() {
                cambiarTipoBusquedaPedido('descripcion');
            });
        }
    }

    function cambiarTipoBusquedaPedido(tipo) {
        tipoBusquedaPedido = tipo;
        const label = document.getElementById('pedidoLabelBusqueda');
        const input = document.getElementById('pedidoInputBusqueda');

        if (tipo === 'codigo') {
            if (label) label.textContent = 'Código del cliente:';
            if (input) input.placeholder = 'Ingrese el código';
        } else {
            if (label) label.textContent = 'Descripción (Razón Social):';
            if (input) input.placeholder = 'Ingrese razón social o nombre';
        }

        if (input) input.value = '';
        ocultarErrorBusquedaPedido();
    }

    function resetearBusquedaPedido() {
        const input = document.getElementById('pedidoInputBusqueda');
        const radioCodigo = document.getElementById('pedidoRadioCodigo');

        if (input) input.value = '';
        if (radioCodigo) radioCodigo.checked = true;
        tipoBusquedaPedido = 'codigo';

        const label = document.getElementById('pedidoLabelBusqueda');
        if (label) label.textContent = 'Código del cliente:';
        if (input) input.placeholder = 'Ingrese el código';

        mostrarSeccionBusquedaPedido('busqueda');
        ocultarErrorBusquedaPedido();
    }

    function mostrarSeccionBusquedaPedido(seccion) {
        const seccionBusqueda = document.getElementById('pedidoSeccionBusqueda');
        const loadingBusqueda = document.getElementById('pedidoLoadingBusqueda');
        const listaResultados = document.getElementById('pedidoListaResultados');

        if (seccionBusqueda) seccionBusqueda.classList.add('d-none');
        if (loadingBusqueda) loadingBusqueda.classList.add('d-none');
        if (listaResultados) listaResultados.classList.add('d-none');

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
        }
    }

    function ejecutarBusquedaPedido() {
        const inputEl = document.getElementById('pedidoInputBusqueda');
        const input = inputEl ? inputEl.value.trim() : '';

        if (!input) {
            mostrarErrorBusquedaPedido('Debe ingresar un valor para buscar');
            return;
        }

        ocultarErrorBusquedaPedido();
        mostrarSeccionBusquedaPedido('loading');

        let promesaBusqueda;

        if (tipoBusquedaPedido === 'codigo') {
            if (!/^\d+$/.test(input)) {
                mostrarErrorBusquedaPedido('El código debe ser numérico');
                mostrarSeccionBusquedaPedido('busqueda');
                return;
            }
            promesaBusqueda = buscarClientePorCodigo(input);
        } else {
            promesaBusqueda = buscarClientePorDescripcion(input);
        }

        promesaBusqueda.catch(err => {
            console.error('❌ Error en búsqueda:', err);
            mostrarSeccionBusquedaPedido('busqueda');
            if (window.mostrarErrorBloqueante) {
                window.mostrarErrorBloqueante(err.message || 'Error al buscar');
            }
        });
    }

    async function buscarClientePorCodigo(codigo) {
        const response = await fetch(`/ventas/buscar-codigo/?codigo=${encodeURIComponent(codigo)}`);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error en la búsqueda');
        }

        const data = await response.json();
        console.log('📦 Datos cliente recibidos:', data);

        if (data.CLIENTE) {
            if (data.Mensaje && data.Mensaje.trim() !== '' && window.mostrarAlerta) {
                await window.mostrarAlerta(data.Mensaje, 'info-modal');
            }
            onClienteSeleccionado(data.CLIENTE);
        } else {
            mostrarSeccionBusquedaPedido('busqueda');
            if (data.Mensaje && window.mostrarAlerta) {
                window.mostrarAlerta(data.Mensaje, 'info-modal');
            }
        }

        return data;
    }

    async function buscarClientePorDescripcion(descripcion) {
        const response = await fetch(`/ventas/buscar-descripcion/?descripcion=${encodeURIComponent(descripcion)}`);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error en la búsqueda');
        }

        const data = await response.json();
        console.log('📦 Datos clientes recibidos:', data);

        if (data.CLIENTES && data.CLIENTES.length > 0) {
            if (data.Mensaje && data.Mensaje.trim() !== '' && window.mostrarAlerta) {
                await window.mostrarAlerta(data.Mensaje, 'info-modal');
            }

            if (data.CLIENTES.length === 1) {
                buscarClientePorCodigo(data.CLIENTES[0].codigo);
            } else {
                mostrarListaClientesPedido(data.CLIENTES);
            }
        } else {
            mostrarSeccionBusquedaPedido('busqueda');
            if (data.Mensaje && window.mostrarAlerta) {
                window.mostrarAlerta(data.Mensaje, 'info-modal');
            }
        }

        return data;
    }

    function mostrarListaClientesPedido(clientes) {
        const container = document.getElementById('pedidoListaClientes');
        if (!container) return;

        container.innerHTML = '';

        clientes.forEach(cliente => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action cliente-item';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="cliente-codigo">${cliente.codigo || '-'}</span>
                        <span class="cliente-nombre ms-2">${cliente.descripcion || 'Sin nombre'}</span>
                    </div>
                    <i class="fas fa-chevron-right text-muted"></i>
                </div>
            `;

            item.addEventListener('click', () => {
                mostrarSeccionBusquedaPedido('loading');
                buscarClientePorCodigo(cliente.codigo);
            });

            container.appendChild(item);
        });

        const cantidadEl = document.getElementById('pedidoCantidadClientes');
        if (cantidadEl) cantidadEl.textContent = clientes.length;

        mostrarSeccionBusquedaPedido('lista');
    }

    function mostrarErrorBusquedaPedido(mensaje) {
        const errorEl = document.getElementById('pedidoErrorBusqueda');
        const mensajeEl = document.getElementById('pedidoErrorMensaje');

        if (mensajeEl) mensajeEl.textContent = mensaje;
        if (errorEl) errorEl.classList.remove('d-none');
    }

    function ocultarErrorBusquedaPedido() {
        const errorEl = document.getElementById('pedidoErrorBusqueda');
        if (errorEl) errorEl.classList.add('d-none');
    }

    // ============================================
    // ABRIR MODAL
    // ============================================

    function abrirModalCargarPedido() {
        console.log('🔵 Abriendo wizard de carga de pedido...');

        if (!modalCargarPedido) {
            console.error('❌ Modal de cargar pedido no inicializado');
            if (window.mostrarAlerta) {
                window.mostrarAlerta('Error al abrir el formulario de pedido', 'error-modal');
            }
            return;
        }

        resetearWizard();
        modalCargarPedido.show();
        irAPaso(1);
    }

    // ============================================
    // NAVEGACION DEL WIZARD
    // ============================================

    function irAPaso(numeroPaso) {
        if (numeroPaso < 1 || numeroPaso > estadoPedido.totalPasos) return;

        const pasoAnterior = estadoPedido.pasoActual;

        if (configPasos[pasoAnterior] && configPasos[pasoAnterior].alSalir) {
            configPasos[pasoAnterior].alSalir();
        }

        estadoPedido.pasoActual = numeroPaso;
        actualizarStepper();
        mostrarContenidoPaso(numeroPaso);
        actualizarBotonesNavegacion();

        if (configPasos[numeroPaso] && configPasos[numeroPaso].alEntrar) {
            configPasos[numeroPaso].alEntrar();
        }
    }

    function irPasoAnterior() {
        if (estadoPedido.pasoActual > 1) {
            irAPaso(estadoPedido.pasoActual - 1);
        }
    }

    async function irPasoSiguiente() {
        const pasoActual = estadoPedido.pasoActual;

        if (!configPasos[pasoActual].validar()) {
            console.warn('⚠️ Validacion del paso fallida');
            return;
        }

        // Paso 1: Consultar lista de precios antes de avanzar
        if (pasoActual === 1 && estadoPedido.cliente) {
            const btnSiguiente = document.getElementById('btnWizardSiguiente');
            const btnAtras = document.getElementById('btnWizardAtras');
            const textoOriginal = btnSiguiente ? btnSiguiente.innerHTML : '';

            if (btnSiguiente) {
                btnSiguiente.disabled = true;
                btnSiguiente.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Consultando...';
            }
            if (btnAtras) btnAtras.disabled = true;

            try {
                await consultarListaPreciosCliente(estadoPedido.cliente.codigo);
                console.log('✅ Lista de precios cargada, avanzando al paso 2');
                if (pasoActual < estadoPedido.totalPasos) {
                    irAPaso(pasoActual + 1);
                }
            } catch (err) {
                console.error('❌ Error al consultar lista de precios:', err);
                if (window.mostrarErrorBloqueante) {
                    window.mostrarErrorBloqueante(err.message || 'Error al consultar lista de precios');
                }
                // Restaurar botón en caso de error
                if (btnSiguiente) {
                    btnSiguiente.innerHTML = textoOriginal;
                    btnSiguiente.disabled = false;
                }
                if (btnAtras) btnAtras.disabled = false;
            }
            return;
        }

        if (pasoActual < estadoPedido.totalPasos) {
            irAPaso(pasoActual + 1);
        } else {
            confirmarPedido();
        }
    }

    function actualizarStepper() {
        const pasoActual = estadoPedido.pasoActual;

        document.querySelectorAll('#modalCargarPedido .stepper-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            const numberEl = step.querySelector('.step-number');
            const checkEl = step.querySelector('.step-check');

            step.classList.remove('active', 'completed');

            if (stepNum < pasoActual) {
                step.classList.add('completed');
                numberEl.classList.add('d-none');
                checkEl.classList.remove('d-none');
            } else if (stepNum === pasoActual) {
                step.classList.add('active');
                numberEl.classList.remove('d-none');
                checkEl.classList.add('d-none');
            } else {
                numberEl.classList.remove('d-none');
                checkEl.classList.add('d-none');
            }
        });

        document.querySelectorAll('#modalCargarPedido .stepper-line').forEach((line, index) => {
            if (index + 1 < pasoActual) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });
    }

    function mostrarContenidoPaso(numeroPaso) {
        document.querySelectorAll('#modalCargarPedido .wizard-step-content').forEach(content => {
            content.classList.add('d-none');
        });

        const pasoElement = document.getElementById(`wizardStep${numeroPaso}`);
        if (pasoElement) {
            pasoElement.classList.remove('d-none');
        }
    }

    function actualizarBotonesNavegacion() {
        const btnAtras = document.getElementById('btnWizardAtras');
        const btnSiguiente = document.getElementById('btnWizardSiguiente');
        const pasoActual = estadoPedido.pasoActual;

        btnAtras.disabled = (pasoActual === 1);

        const pasoValido = configPasos[pasoActual].validar();
        btnSiguiente.disabled = !pasoValido;

        if (pasoActual === estadoPedido.totalPasos) {
            btnSiguiente.innerHTML = '<i class="fas fa-check me-1"></i>Confirmar';
            btnSiguiente.classList.remove('btn-primary');
            btnSiguiente.classList.add('btn-success');
            btnSiguiente.setAttribute('aria-label', 'Confirmar pedido');
        } else {
            btnSiguiente.innerHTML = 'Siguiente<i class="fas fa-arrow-right ms-1"></i>';
            btnSiguiente.classList.remove('btn-success');
            btnSiguiente.classList.add('btn-primary');
            btnSiguiente.setAttribute('aria-label', 'Continuar al siguiente paso');
        }

        // Actualizar título del modal según el paso actual
        const tituloEl = document.getElementById('tituloModalPedido');
        if (tituloEl && configPasos[pasoActual]) {
            tituloEl.textContent = `${configPasos[pasoActual].titulo}`;
        }
    }

    // ============================================
    // PASO 1: CLIENTE
    // ============================================

    function inicializarPaso1() {
        if (estadoPedido.cliente) {
            mostrarResumenCliente();
        } else {
            mostrarBusquedaCliente();
        }
    }

    function mostrarBusquedaCliente() {
        document.getElementById('pedidoBusquedaCliente').classList.remove('d-none');
        document.getElementById('pedidoClienteSeleccionado').classList.add('d-none');
        resetearBusquedaPedido();
        actualizarBotonesNavegacion();
    }

    function onClienteSeleccionado(cliente) {
        console.log('✅ Cliente seleccionado para pedido:', cliente);
        estadoPedido.cliente = cliente;
        mostrarResumenCliente();
        actualizarBotonesNavegacion();
    }

    function mostrarResumenCliente() {
        const cliente = estadoPedido.cliente;
        if (!cliente) return;

        document.getElementById('pedidoBusquedaCliente').classList.add('d-none');
        document.getElementById('pedidoClienteSeleccionado').classList.remove('d-none');

        document.getElementById('pedidoClienteCodigo').textContent = cliente.codigo || '-';
        document.getElementById('pedidoClienteNombre').textContent = cliente.descripcion || '-';
        document.getElementById('pedidoClienteCuit').textContent = cliente.cuit || '-';
    }

    function cambiarCliente() {
        estadoPedido.cliente = null;
        mostrarBusquedaCliente();
    }

    // ============================================
    // CONSULTA LISTA DE PRECIOS (PASO 1 → 2)
    // ============================================

    async function consultarListaPreciosCliente(codigoCliente) {
        console.log('🔍 Consultando lista de precios para cliente:', codigoCliente);
        
        const response = await fetch(`/ventas/lista-precios-cliente/?codigo_cliente=${encodeURIComponent(codigoCliente)}`);
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error al consultar lista de precios');
        }
        
        const data = await response.json();
        console.log('📦 Lista de precios recibida:', data);
        estadoPedido.listaPrecio = data;
        return data;
    }

    // ============================================
    // PASO 4: CONFIRMAR PEDIDO
    // ============================================

    function confirmarPedido() {
        console.log('📤 Confirmando pedido:', estadoPedido);
        if (window.mostrarAlerta) {
            window.mostrarAlerta('Funcionalidad de confirmar pedido por implementar', 'info-modal');
        }
    }

    // ============================================
    // UTILIDADES
    // ============================================

    function resetearWizard() {
        estadoPedido.pasoActual = 1;
        estadoPedido.cliente = null;
        estadoPedido.listaPrecio = null;
        estadoPedido.productos = [];
        estadoPedido.observaciones = '';

        document.querySelectorAll('#modalCargarPedido .stepper-step').forEach(step => {
            step.classList.remove('active', 'completed');
            step.querySelector('.step-number').classList.remove('d-none');
            step.querySelector('.step-check').classList.add('d-none');
        });
        document.querySelectorAll('#modalCargarPedido .stepper-line').forEach(line => {
            line.classList.remove('completed');
        });

        document.getElementById('pedidoClienteSeleccionado').classList.add('d-none');
        document.getElementById('pedidoBusquedaCliente').classList.remove('d-none');

        resetearBusquedaPedido();

        console.log('🔄 Wizard reseteado');
    }

    // ============================================
    // INICIALIZACION Y EXPORTS
    // ============================================

    document.addEventListener('DOMContentLoaded', inicializarModalCargarPedido);

    window.abrirModalCargarPedido = abrirModalCargarPedido;

    console.log('✅ cargaPedidos.js cargado');
})();
