// ============================================
// MÓDULO: GESTIÓN DE MODALES
// ============================================
(function() {
    'use strict';
    
    let modalChequesCartera = null;
    let modalErrorBloqueante = null;

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
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
    }

    // ============================================
    // MODALES DE ERROR
    // ============================================
    
    /**
     * Mostrar error bloqueante (sesión expirada, errores críticos)
     */
    function mostrarErrorBloqueante(mensaje, redirectUrl) {
        console.log('🚫 Mostrando error bloqueante:', mensaje);
        
        const mensajeEl = document.getElementById('errorBloqueanteTexto');
        const btnRedirect = document.getElementById('btn-redirect-bloqueante');
        
        if (mensajeEl) {
            mensajeEl.textContent = mensaje;
        }
        
        if (btnRedirect) {
            btnRedirect.onclick = function() {
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    // Si no hay URL, solo cerrar el modal
                    if (modalErrorBloqueante) {
                        modalErrorBloqueante.hide();
                    }
                }
            };
        }
        
        if (modalErrorBloqueante) {
            modalErrorBloqueante.show();
        } else {
            alert(mensaje);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }
    }

    // ============================================
    // MENSAJES INFORMATIVOS
    // ============================================
    
    /**
     * Mostrar mensaje informativo general (no bloqueante)
     * Se muestra en la parte superior de la página
     */
    function mostrarMensajeInfoGeneral(mensaje) {
        if (!mensaje || mensaje.trim() === '') return;
        
        console.log('📢 Mensaje general de VFP:', mensaje);
        
        const infoDiv = document.getElementById('mensajeInfoGeneral');
        const infoTexto = document.getElementById('mensajeInfoGeneralTexto');
        
        if (infoDiv && infoTexto) {
            infoTexto.textContent = mensaje;
            infoDiv.classList.remove('d-none');
        }
    }
    
    /**
     * Mostrar mensaje informativo en modal de cheques
     */
    function mostrarMensajeInfoCheques(mensaje) {
        if (!mensaje || mensaje.trim() === '') return;
        
        console.log('📢 Mensaje de VFP (cheques):', mensaje);
        
        const infoDiv = document.getElementById('chequesMensajeInfo');
        const infoTexto = document.getElementById('chequesMensajeInfoTexto');
        
        if (infoDiv && infoTexto) {
            infoTexto.textContent = mensaje;
            infoDiv.classList.remove('d-none');
        }
    }
    
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
     */
    function mostrarAlerta(mensaje, tipo = 'info-modal') {
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
        
        const modalAlerta = new bootstrap.Modal(document.getElementById('modalAlerta'));
        modalAlerta.show();
    }

    // ============================================
    // MODAL DE CHEQUES
    // ============================================
    
    /**
     * Abrir modal de cheques en cartera
     */
    function abrirModalChequesCartera() {
        console.log('🔵 Abriendo modal de cheques...');
        
        if (!modalChequesCartera) {
            console.error('❌ Modal de cheques no inicializado');
            alert('Error al abrir modal de cheques');
            return;
        }
        
        modalChequesCartera.show();
        
        // Resetear estado del modal
        document.getElementById('chequesLoading').classList.remove('d-none');
        document.getElementById('chequesError').classList.add('d-none');
        document.getElementById('chequesMensajeInfo').classList.add('d-none');
        document.getElementById('chequesResultados').classList.add('d-none');
        
        // Hacer petición (debe estar definida en informes.js)
        if (window.consultarChequesCartera) {
            window.consultarChequesCartera();
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
    window.mostrarMensajeInfoGeneral = mostrarMensajeInfoGeneral;
    window.mostrarMensajeInfoCheques = mostrarMensajeInfoCheques;
    window.mostrarErrorCheques = mostrarErrorCheques;
    window.abrirModalChequesCartera = abrirModalChequesCartera;
    window.mostrarAlerta = mostrarAlerta;

    console.log('✅ modales.js cargado');
})();