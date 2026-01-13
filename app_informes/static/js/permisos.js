// ============================================
// PERMISOS.JS - Gestión de permisos de módulos
// ============================================
(function() {
    'use strict';
    
    console.log('🔐 Cargando permisos.js');

    /**
     * Cargar permisos de módulos desde VFP
     */
    function cargarPermisosModulos() {
        // ✅ Asegurar que el loading esté visible
        const loadingElement = document.getElementById('modulosLoading');
        const containerElement = document.getElementById('modulosContainer');
        
        if (loadingElement) loadingElement.classList.remove('d-none');
        if (containerElement) containerElement.classList.add('d-none');
        
        fetch('/auth/permisos-informes/')
            .then(r => {
                if (!r.ok) {
                    return r.json().then(errData => {
                        throw new Error(errData.error || 'Error desconocido');
                    });
                }
                return r.json();
            })
            .then(data => {
                const modulosPermitidos = data.informes;
                
                // Mostrar mensaje si existe
                if (data.mensaje && data.mensaje.trim() !== '') {
                    mostrarAlerta(data.mensaje, 'info-modal');
                }
                
                // Habilitar módulos permitidos
                document.querySelectorAll('.module-tab').forEach(btn => {
                    const modulo = btn.dataset.module;
                    if (modulosPermitidos.includes(modulo)) {
                        btn.disabled = false;
                        btn.classList.add(`module-${modulo}-enabled`);
                    }
                });
                
                // ❌ COMENTAR PARA QUE NO SE ACTIVE NINGÚN TAB AL INICIO
                // if (modulosPermitidos.length > 0) {
                //     setTimeout(() => {
                //         const primerModulo = modulosPermitidos[0];
                //         activarTabManualmente(primerModulo);
                //     }, 150);
                // }
            })
            .catch(err => {
                console.error('Error al cargar permisos:', err);
                mostrarErrorBloqueante(err.message, 'https://cormons.app/');
            });
    }

    /**
     * Activar tab manualmente sin usar Bootstrap API
     */
    function activarTabManualmente(nombreModulo) {
        // Desactivar todos los tabs
        document.querySelectorAll('.module-tab').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        
        // Activar el tab seleccionado
        const tabBtn = document.querySelector(`.module-tab[data-module="${nombreModulo}"]`);
        const tabPane = document.querySelector(`#${nombreModulo}`);
        
        if (tabBtn && tabPane) {
            tabBtn.classList.add('active');
            tabBtn.setAttribute('aria-selected', 'true');
            
            tabPane.classList.add('show', 'active');
            
            console.log(`✅ Tab "${nombreModulo}" activado manualmente`);
        }
    }

    // Exponer funciones globalmente
    window.cargarPermisosModulos = cargarPermisosModulos;
    window.activarTabManualmente = activarTabManualmente;
    
    console.log('✅ permisos.js cargado');
})();