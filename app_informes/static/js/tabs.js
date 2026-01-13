// ============================================
// TABS.JS - Gestión de pestañas de módulos
// ============================================
(function() {
    'use strict';
    
    console.log('📑 Cargando tabs.js');

    /**
     * Inicializar comportamiento de tabs
     */
    function inicializarTabs() {
        const tabButtons = document.querySelectorAll('.module-tab');
        
        tabButtons.forEach(button => {
            // ✅ Manejar click manualmente
            button.addEventListener('click', function(event) {
                event.preventDefault();
                
                const modulo = this.dataset.module;
                
                // Desactivar todos
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                
                // Activar el clickeado
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // ✅ Usar data-module en lugar de data-bs-target
                const targetPane = document.querySelector(`#${modulo}`);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
                
                console.log(`✅ Tab activado: ${modulo}`);
            });
        });
        
        console.log('✅ Tabs inicializados con manejo manual');
    }

    // Exponer funciones globalmente
    window.inicializarTabs = inicializarTabs;
    
    console.log('✅ tabs.js cargado');
})();