// ============================================
// ESTADO CLIENTE.JS - Visualización de estado de cliente
// Usa busquedaCliente.js para la búsqueda
// ============================================
(function() {
    'use strict';

    console.log('👤 Cargando estadoCliente.js');

    let modalEstadoCliente = null;

    /**
     * Inicializar modal
     */
    function inicializarModalEstadoCliente() {
        const modalElement = document.getElementById('modalEstadoCliente');
        if (modalElement && window.bootstrap) {
            modalEstadoCliente = new bootstrap.Modal(modalElement);

            // Evento para botón "Nueva Búsqueda"
            const btnNuevaBusqueda = document.getElementById('btnNuevaBusqueda');
            if (btnNuevaBusqueda) {
                btnNuevaBusqueda.addEventListener('click', function() {
                    volverABusqueda();
                });
            }

            console.log('✅ Modal de estado cliente inicializado');
        }
    }

    /**
     * Abrir modal de estado de cliente
     */
    function abrirModalEstadoCliente() {
        console.log('🔵 Abriendo modal de estado de cliente...');

        if (!modalEstadoCliente) {
            console.error('❌ Modal de estado cliente no inicializado');
            alert('Error al abrir modal de estado de cliente');
            return;
        }

        // Abrir modal
        modalEstadoCliente.show();

        // Iniciar búsqueda con callback para cuando se seleccione un cliente
        iniciarBusquedaCliente(function(cliente) {
            console.log('✅ Cliente seleccionado:', cliente);
            mostrarInformacionCliente(cliente);
        });
    }

    /**
     * Mostrar información completa del cliente
     */
    function mostrarInformacionCliente(cliente) {
        // Mostrar sección de información
        mostrarSeccionCliente('informacion');

        const infoCliente = document.getElementById('infoCliente');
        if (infoCliente) infoCliente.classList.remove('d-none');

        // Observaciones (solo si existen)
        const obsContainer = document.getElementById('observacionesContainer');
        const obsTexto = document.getElementById('observacionesTexto');
        if (cliente.observaciones && cliente.observaciones.trim() !== '') {
            obsTexto.textContent = cliente.observaciones;
            obsContainer.classList.remove('d-none');
        } else {
            obsContainer.classList.add('d-none');
        }

        // Datos principales
        document.getElementById('clienteCodigo').textContent = cliente.codigo || '-';
        document.getElementById('clienteRazonSocial').textContent = cliente.razonSocial || '-';
        document.getElementById('clienteCuit').textContent = cliente.cuit || '-';

        // Saldo con color
        const saldo = parseFloat(cliente.saldoCtaCte) || 0;
        const saldoEl = document.getElementById('clienteSaldo');
        saldoEl.textContent = formatearMoneda(saldo);

        // Aplicar color según saldo
        saldoEl.classList.remove('text-danger', 'text-success', 'text-muted');
        if (saldo > 0) {
            saldoEl.classList.add('text-danger'); // Cliente debe (rojo)
        } else if (saldo < 0) {
            saldoEl.classList.add('text-success'); // A favor del cliente (verde)
        } else {
            saldoEl.classList.add('text-muted'); // Cero (gris)
        }

        // Movimientos
        document.getElementById('clienteFechaCompra').textContent = cliente.fechaUltimaCompra || '-';

        const importeCompra = parseFloat(cliente.importeUltimaCompra) || 0;
        document.getElementById('clienteImporteCompra').textContent =
            importeCompra ? formatearMoneda(importeCompra) : '-';

        document.getElementById('clienteFechaPago').textContent = cliente.fechaUltimoPago || '-';

        // Nota
        document.getElementById('clienteNota').textContent = cliente.nota || '-';
    }

    // Inicializar al cargar DOM
    document.addEventListener('DOMContentLoaded', inicializarModalEstadoCliente);

    // Exponer funciones globalmente
    window.abrirModalEstadoCliente = abrirModalEstadoCliente;

    console.log('✅ estadoCliente.js cargado');
})();
