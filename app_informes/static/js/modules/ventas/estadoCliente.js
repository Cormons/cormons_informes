// ============================================
// ESTADO CLIENTE.JS - Lógica de estado de cliente
// ============================================
(function() {
    'use strict';
    
    console.log('👤 Cargando estadoCliente.js');

    let modalEstadoCliente = null;
    let tipoBusquedaActual = 'codigo';
    
    /**
     * Inicializar modal y eventos
     */
    function inicializarModalEstadoCliente() {
        const modalElement = document.getElementById('modalEstadoCliente');
        if (modalElement && window.bootstrap) {
            modalEstadoCliente = new bootstrap.Modal(modalElement);
            
            // Event listeners
            document.getElementById('btnBuscar').addEventListener('click', ejecutarBusqueda);
            document.getElementById('btnNuevaBusqueda').addEventListener('click', volverABusqueda);
            document.getElementById('inputBusqueda').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') ejecutarBusqueda();
            });
            
            // Cambiar tipo de búsqueda
            document.querySelectorAll('input[name="tipoBusqueda"]').forEach(radio => {
                radio.addEventListener('change', cambiarTipoBusqueda);
            });
            
            console.log('✅ Modal de estado cliente inicializado');
        }
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
        
        // Limpiar input
        input.value = '';
        ocultarError();
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
        
        // Resetear modal
        resetearModal();
        
        // Abrir modal
        modalEstadoCliente.show();
    }
    
    /**
     * Resetear estado del modal
     */
    function resetearModal() {
        // Limpiar input
        document.getElementById('inputBusqueda').value = '';
        
        // Resetear a búsqueda por código
        document.getElementById('radioCodigo').checked = true;
        tipoBusquedaActual = 'codigo';
        cambiarTipoBusqueda({ target: { value: 'codigo' } });
        
        // Mostrar sección de búsqueda, ocultar información
        document.getElementById('seccionBusqueda').classList.remove('d-none');
        document.getElementById('seccionInformacion').classList.add('d-none');
        
        // Ocultar elementos de búsqueda
        document.getElementById('loadingBusqueda').classList.add('d-none');
        document.getElementById('listaResultados').classList.add('d-none');
        ocultarError();
    }
    
    /**
     * Ejecutar búsqueda según tipo
     */
    function ejecutarBusqueda() {
        const input = document.getElementById('inputBusqueda').value.trim();
        
        if (!input) {
            mostrarError('Debe ingresar un valor para buscar');
            return;
        }
        
        ocultarError();
        document.getElementById('listaResultados').classList.add('d-none');
        document.getElementById('loadingBusqueda').classList.remove('d-none');
        
        let promesaBusqueda;
        
        if (tipoBusquedaActual === 'codigo') {
            promesaBusqueda = buscarPorCodigo(input);
        } else {
            promesaBusqueda = buscarPorDescripcion(input);
        }
        
        // Manejar errores propagados
        promesaBusqueda.catch(err => {
            console.error('❌ Error en búsqueda:', err);
            
            // Cerrar modal
            if (modalEstadoCliente) {
                modalEstadoCliente.hide();
            }
            
            // Mostrar error bloqueante después de cerrar
            setTimeout(() => {
                mostrarErrorBloqueante(err.message, null);
            }, 300);
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
                
                document.getElementById('loadingBusqueda').classList.add('d-none');
                
                if (data.CLIENTE) {
                    // ✅ Hay cliente, mostrar información
                    mostrarInformacionCliente(data.CLIENTE);
                    
                    // Mostrar mensaje informativo si existe
                    if (data.Mensaje && data.Mensaje.trim() !== '') {
                        setTimeout(() => {
                            mostrarAlerta(data.Mensaje, 'info-modal');
                        }, 300);
                    }
                } else {
                    // ❌ NO hay cliente pero estado=true
                    // Cerrar modal y mostrar mensaje informativo
                    if (modalEstadoCliente) {
                        modalEstadoCliente.hide();
                    }
                    
                    const mensaje = data.Mensaje || 'No se encontró el cliente';
                    setTimeout(() => {
                        mostrarAlerta(mensaje, 'info-modal');
                    }, 300);
                }
                
                return data;
            })
            .catch(error => {
                console.error('❌ Error al buscar por código:', error);
                document.getElementById('loadingBusqueda').classList.add('d-none');
                
                // Propagar el error para que quien llamó lo maneje
                throw error;
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
                
                document.getElementById('loadingBusqueda').classList.add('d-none');
                
                if (data.CLIENTES && data.CLIENTES.length > 0) {
                    // ✅ Hay clientes
                    if (data.CLIENTES.length === 1) {
                        // Un solo resultado, mostrar directamente
                        mostrarInformacionCliente(data.CLIENTES[0]);
                    } else {
                        // Múltiples resultados, mostrar lista
                        mostrarListaClientes(data.CLIENTES);
                    }
                    
                    // Mostrar mensaje informativo si existe
                    if (data.Mensaje && data.Mensaje.trim() !== '') {
                        setTimeout(() => {
                            mostrarAlerta(data.Mensaje, 'info-modal');
                        }, 300);
                    }
                } else {
                    // ❌ NO hay clientes pero estado=true
                    // Cerrar modal y mostrar mensaje informativo
                    if (modalEstadoCliente) {
                        modalEstadoCliente.hide();
                    }
                    
                    const mensaje = data.Mensaje || 'No se encontraron clientes';
                    setTimeout(() => {
                        mostrarAlerta(mensaje, 'info-modal');
                    }, 300);
                }
                
                return data;
            })
            .catch(error => {
                console.error('❌ Error al buscar por descripción:', error);
                document.getElementById('loadingBusqueda').classList.add('d-none');
                
                // Propagar el error para que quien llamó lo maneje
                throw error;
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
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${cliente.codigo || '-'}</strong> - ${cliente.razonSocial || 'Sin nombre'}
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
            
            item.addEventListener('click', () => {
                // Al hacer clic, buscar información completa de ese cliente
                buscarPorCodigo(cliente.codigo);
            });
            
            container.appendChild(item);
        });
        
        document.getElementById('listaResultados').classList.remove('d-none');
    }
    
    /**
     * Mostrar información completa del cliente
     */
    function mostrarInformacionCliente(cliente) {
        // Ocultar búsqueda, mostrar información
        document.getElementById('seccionBusqueda').classList.add('d-none');
        document.getElementById('seccionInformacion').classList.remove('d-none');
        document.getElementById('infoCliente').classList.remove('d-none');
        
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
        
        // Saldo (por ahora sin color, solo mostrar)
        const saldo = parseFloat(cliente.saldoCtaCte) || 0;
        document.getElementById('clienteSaldo').textContent = formatearMoneda(saldo);
        
        // Movimientos
        document.getElementById('clienteFechaCompra').textContent = cliente.fechaUltimaCompra || '-';
        
        const importeCompra = parseFloat(cliente.importeUltimaCompra) || 0;
        document.getElementById('clienteImporteCompra').textContent = formatearMoneda(importeCompra);
        
        document.getElementById('clienteFechaPago').textContent = cliente.fechaUltimoPago || '-';
        
        // Nota
        document.getElementById('clienteNota').textContent = cliente.nota || '-';
    }
    
    /**
     * Volver a la búsqueda
     */
    function volverABusqueda() {
        document.getElementById('seccionInformacion').classList.add('d-none');
        document.getElementById('seccionBusqueda').classList.remove('d-none');
    }
    
    /**
     * Mostrar error de búsqueda
     */
    function mostrarError(mensaje) {
        document.getElementById('errorBusquedaMensaje').textContent = mensaje;
        document.getElementById('errorBusqueda').classList.remove('d-none');
    }
    
    /**
     * Ocultar error de búsqueda
     */
    function ocultarError() {
        document.getElementById('errorBusqueda').classList.add('d-none');
    }
    
    // Inicializar al cargar DOM
    document.addEventListener('DOMContentLoaded', inicializarModalEstadoCliente);
    
    // Exponer funciones globalmente
    window.abrirModalEstadoCliente = abrirModalEstadoCliente;
    
    console.log('✅ estadoCliente.js cargado');
})();