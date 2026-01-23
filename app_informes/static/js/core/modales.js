// ============================================
// MÓDULO: GESTIÓN DE MODALES
// ============================================
(function() {
    'use strict';
    
    let modalChequesCartera = null;
    let modalErrorBloqueante = null;
    let modalAlerta = null;

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    /**
     * Limpiar backdrops huérfanos de Bootstrap
     */
    function limpiarBackdrops() {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
    }
    
    /**
     * Inicializar modales de Bootstrap
     */
    function inicializarModales() {
        const modalChequesElement = document.getElementById('modalChequesCartera');
        if (modalChequesElement && window.bootstrap) {
            modalChequesCartera = new bootstrap.Modal(modalChequesElement);
            console.log('✅ Modal de cheques inicializado');
        }
        
        const modalErrorElement = document.getElementById('modalErrorBloqueante');
        if (modalErrorElement && window.bootstrap) {
            modalErrorBloqueante = new bootstrap.Modal(modalErrorElement, {
                backdrop: 'static',
                keyboard: false
            });
            console.log('✅ Modal de error bloqueante inicializado');
        }
        
        const modalAlertaElement = document.getElementById('modalAlerta');
        if (modalAlertaElement && window.bootstrap) {
            modalAlerta = new bootstrap.Modal(modalAlertaElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            
            console.log('✅ Modal de alerta inicializado');
        }
    }

    // ============================================
    // MODALES DE ERROR
    // ============================================
    
    /**
     * Mostrar error bloqueante (sesión expirada, errores críticos)
     * Siempre redirige a logout por defecto
     */
    function mostrarErrorBloqueante(mensaje, redirectUrl = '/logout/') {
        console.log('🚫 Mostrando error bloqueante:', mensaje);

        const mensajeEl = document.getElementById('errorBloqueanteTexto');
        const btnRedirect = document.getElementById('btn-redirect-bloqueante');

        if (mensajeEl) {
            mensajeEl.textContent = mensaje;
        }

        if (btnRedirect) {
            btnRedirect.onclick = function() {
                window.location.href = redirectUrl;
            };
        }

        if (modalErrorBloqueante) {
            const modalElement = document.getElementById('modalErrorBloqueante');

            // Marcar el backdrop del modal de error para que tenga z-index más alto
            const onShown = () => {
                modalElement.removeEventListener('shown.bs.modal', onShown);
                // Buscar el backdrop más reciente y marcarlo
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length > 0) {
                    const lastBackdrop = backdrops[backdrops.length - 1];
                    lastBackdrop.classList.add('modal-error-backdrop');
                }
            };
            modalElement.addEventListener('shown.bs.modal', onShown);

            modalErrorBloqueante.show();
        } else {
            alert(mensaje);
            window.location.href = redirectUrl;
        }
    }

    // ============================================
    // MENSAJES INFORMATIVOS
    // ============================================
    
   
    
    
    
    /**
     * Mostrar error en modal de cheques
     */
    function mostrarErrorCheques(mensaje) {
        console.error('❌ Error en cheques:', mensaje);
        
        const errorDiv = document.getElementById('chequesError');
        const errorMensaje = document.getElementById('chequesErrorMensaje');
        
        if (errorDiv && errorMensaje) {
            errorMensaje.textContent = mensaje;
            errorDiv.classList.remove('d-none');
        }
    }
    
    /**
     * Mostrar modal de alerta genérico
     * @param {string} mensaje - Texto a mostrar
     * @param {string} tipo - 'info-modal' (azul) o 'error-modal' (rojo)
     * @returns {Promise} - Se resuelve cuando el usuario cierra el modal
     */
    function mostrarAlerta(mensaje, tipo = 'info-modal') {
        if (!mensaje || mensaje.trim() === '') return Promise.resolve();

        return new Promise((resolve) => {
            const configs = {
                'info-modal': {
                    headerClass: 'bg-info text-white',
                    titulo: 'Información',
                    icono: 'fa-info-circle text-info',
                    btnClass: 'btn-primary'
                },
                'error-modal': {
                    headerClass: 'bg-danger text-white',
                    titulo: 'Error',
                    icono: 'fa-exclamation-circle text-danger',
                    btnClass: 'btn-danger'
                }
            };
            const config = configs[tipo];

            const header = document.getElementById('modal-alerta-header');
            const titulo = document.getElementById('modal-alerta-titulo');
            const icono = document.getElementById('modal-alerta-icono');
            const mensajeEl = document.getElementById('modal-alerta-mensaje');

            if (header) header.className = `modal-header ${config.headerClass}`;
            if (titulo) titulo.innerHTML = `<i class="fas ${config.icono.split(' ')[0]} me-2"></i>${config.titulo}`;
            if (icono) icono.className = `fas ${config.icono}`;
            if (mensajeEl) mensajeEl.textContent = mensaje;

            // Resolver la Promise cuando el usuario cierra el modal
            const modalElement = document.getElementById('modalAlerta');
            const onHidden = () => {
                modalElement.removeEventListener('hidden.bs.modal', onHidden);
                resolve();
            };
            modalElement.addEventListener('hidden.bs.modal', onHidden);

            // Marcar el backdrop del modal de alerta para que tenga z-index más alto
            const onShown = () => {
                modalElement.removeEventListener('shown.bs.modal', onShown);
                // Buscar el backdrop más reciente y marcarlo
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length > 0) {
                    const lastBackdrop = backdrops[backdrops.length - 1];
                    lastBackdrop.classList.add('modal-alerta-backdrop');
                }
            };
            modalElement.addEventListener('shown.bs.modal', onShown);

            // Mostrar el modal (sin limpiar backdrops para no afectar otros modales abiertos)
            setTimeout(() => {
                if (modalAlerta) {
                    modalAlerta.show();
                } else {
                    console.warn('⚠️ Modal de alerta no inicializado, usando alert()');
                    alert(mensaje);
                    resolve();
                }
            }, 50);

            console.log(`ℹ️ Alerta mostrada: ${mensaje.substring(0, 50)}...`);
        });
    }

    // ============================================
    // MODAL DE CHEQUES
    // ============================================
    
    /**
     * Abrir modal de cheques en cartera
     */
    function abrirModalChequesCartera() {
        console.log('🔵 Consultando cheques en cartera...');
        
        if (!modalChequesCartera) {
            console.error('❌ Modal de cheques no inicializado');
            alert('Error al abrir modal de cheques');
            return;
        }
        
        // Limpiar backdrops antes de abrir
        limpiarBackdrops();
        
        // Abrir el modal inmediatamente
        modalChequesCartera.show();
        
        // Resetear estado del modal y mostrar loading
        document.getElementById('chequesLoading').classList.remove('d-none');
        document.getElementById('chequesError').classList.add('d-none');
        
        document.getElementById('chequesResultados').classList.add('d-none');
        
        // Llamar a la función de consulta
        if (window.consultarChequesCartera) {
            window.consultarChequesCartera()
                .then(data => {
                    // Verificar si hay cheques
                    if (data && data.CHEQUES && data.CHEQUES.length > 0) {
                        // Hay cheques → El modal ya está abierto, solo actualizar contenido
                        console.log(`✅ Cargados ${data.CHEQUES.length} cheques`);
                    } else {
                        // No hay cheques → Cerrar modal y mostrar alerta
                        modalChequesCartera.hide();
                        
                        const mensaje = data?.Mensaje || 'No se encontraron cheques en cartera';
                        
                        // Esperar a que el modal se cierre antes de mostrar alerta
                        setTimeout(() => {
                            mostrarAlerta(mensaje, 'info-modal');
                        }, 300);
                        
                        console.log('ℹ️ No hay cheques, mostrando alerta informativa');
                    }
                })
                .catch(err => {
                    // Error en la consulta → Cerrar modal y mostrar error bloqueante
                    console.error('❌ Error al consultar cheques:', err);
                    
                    // Cerrar modal de cheques
                    modalChequesCartera.hide();
                    
                    // Mostrar error bloqueante después de cerrar
                    setTimeout(() => {
                        mostrarErrorBloqueante(err.message);
                    }, 300);
                });
        } else {
            console.error('❌ Función consultarChequesCartera no encontrada');
            mostrarErrorCheques('Error: función de consulta no disponible');
        }
    }

    // ============================================
    // INICIALIZAR AL CARGAR DOM
    // ============================================
    
    document.addEventListener('DOMContentLoaded', inicializarModales);

    // ============================================
    // EXPONER FUNCIONES GLOBALES
    // ============================================
    
    window.mostrarErrorBloqueante = mostrarErrorBloqueante;
    
    
    window.mostrarErrorCheques = mostrarErrorCheques;
    window.abrirModalChequesCartera = abrirModalChequesCartera;
    window.mostrarAlerta = mostrarAlerta;
    window.limpiarBackdrops = limpiarBackdrops;

    console.log('✅ modales.js cargado');
})();