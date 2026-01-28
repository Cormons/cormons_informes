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
        document.getElementById('clienteRazonSocial').textContent = cliente.descripcion || '-';
        document.getElementById('clienteCuit').textContent = cliente.cuit || '-';

        // Saldo con color y clase en el card
        const saldo = parseFloat(cliente.saldoCtaCte) || 0;
        const saldoEl = document.getElementById('clienteSaldo');
        const saldoCard = document.getElementById('clienteSaldoCard');

        saldoEl.textContent = formatearMoneda(saldo);

        // Aplicar clase al card y badge según saldo
        const badgeSaldo = document.getElementById('badgeSaldo');
        saldoCard.classList.remove('positivo', 'negativo', 'cero');
        badgeSaldo.classList.remove('deudor', 'acreedor', 'sin-saldo');

        if (saldo > 0) {
            saldoCard.classList.add('positivo');
            badgeSaldo.classList.add('deudor');
            badgeSaldo.textContent = 'Saldo deudor';
        } else if (saldo < 0) {
            saldoCard.classList.add('negativo');
            badgeSaldo.classList.add('acreedor');
            badgeSaldo.textContent = 'Saldo acreedor';
        } else {
            saldoCard.classList.add('cero');
            badgeSaldo.classList.add('sin-saldo');
            badgeSaldo.textContent = 'Sin saldo en cuenta';
        }

        // Movimientos
        document.getElementById('clienteFechaCompra').textContent = cliente.fechaUltimaCompra || '-';

        const mora = parseInt(cliente.mora) || 0;
        document.getElementById('clienteMora').textContent = mora > 0 ? mora : 'Sin mora';

        document.getElementById('clienteFechaPago').textContent = cliente.fechaUltimoPago || '-';

        // Nota (ocultar si está vacía)
        const notaCard = document.getElementById('clienteNotaCard');
        const notaEl = document.getElementById('clienteNota');
        if (cliente.nota && cliente.nota.trim() !== '' && cliente.nota !== '-') {
            notaEl.textContent = cliente.nota;
            notaCard.classList.remove('empty');
        } else {
            notaCard.classList.add('empty');
        }
    }

    // Inicializar al cargar DOM
    document.addEventListener('DOMContentLoaded', inicializarModalEstadoCliente);

    // Exponer funciones globalmente
    window.abrirModalEstadoCliente = abrirModalEstadoCliente;

    console.log('✅ estadoCliente.js cargado');
})();
