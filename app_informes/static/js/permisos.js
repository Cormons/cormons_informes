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
        fetch('/permisos-informes/')
            .then(r => {
                if (!r.ok) {
                    return r.json().then(errData => {
                        throw new Error(errData.error || 'Error desconocido');
                    });
                }
                return r.json();
            })
            .then(data => {
                // 🚨 VERIFICAR CAMPO "estado"
                if (data.estado === false || data.estado === "False") {
                    throw new Error(data.mensaje || 'Error al cargar permisos de módulos');
                }
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
                
                // 🆕 ACTIVAR EL PRIMER MÓDULO PERMITIDO
                if (modulosPermitidos.length > 0) {
                    const primerModulo = modulosPermitidos[0];
                    const primerBtn = document.querySelector(`.module-tab[data-module="${primerModulo}"]`);
                    const primerTab = document.querySelector(`#${primerModulo}`);
                    
                    if (primerBtn && primerTab) {
                        // Activar botón
                        primerBtn.classList.add('active');
                        // Activar contenido del tab
                        primerTab.classList.add('show', 'active');
                    }
                }
            })
            .catch(err => {
                console.error('Error al cargar permisos:', err);
                mostrarErrorBloqueante(err.message, 'https://cormons.app/');
            });
    }

    // Exponer funciones globalmente
    window.cargarPermisosModulos = cargarPermisosModulos;
    
    console.log('✅ permisos.js cargado');
})();