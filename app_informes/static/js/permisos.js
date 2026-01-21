// ============================================
// PERMISOS.JS - Gestión de permisos de módulos
// ============================================
(function() {
    'use strict';
    
    console.log('🔐 Cargando permisos.js');

    /**
     * Cargar permisos de módulos desde VFP
     * @returns {Promise<string>} - Mensaje de VFP (si existe)
     */
    function cargarPermisosModulos() {
        const loadingElement = document.getElementById('modulosLoading');
        const containerElement = document.getElementById('modulosContainer');
        
        if (loadingElement) loadingElement.classList.remove('d-none');
        if (containerElement) containerElement.classList.add('d-none');
        
        return fetch('/auth/permisos-informes/')
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
                
                // Ocultar loading, mostrar módulos
                if (loadingElement) loadingElement.classList.add('d-none');
                if (containerElement) containerElement.classList.remove('d-none');
                
                // Habilitar módulos permitidos
                document.querySelectorAll('.module-tab').forEach(btn => {
                    const modulo = btn.dataset.module;
                    if (modulosPermitidos.includes(modulo)) {
                        btn.disabled = false;
                        btn.classList.add(`module-${modulo}-enabled`);
                    }
                });
                
                console.log(`✅ Módulos habilitados: ${modulosPermitidos.join(', ')}`);
                
                // Retornar el mensaje (si existe)
                return data.mensaje || '';
            })
            .catch(err => {
                console.error('Error al cargar permisos:', err);
                
                if (loadingElement) loadingElement.classList.add('d-none');
                
                mostrarErrorBloqueante(err.message);
                
                throw err;
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