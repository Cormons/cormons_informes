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
            button.addEventListener('shown.bs.tab', function (event) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
            });
        });
        console.log('✅ Tabs inicializados');
    }

    // Exponer funciones globalmente
    window.inicializarTabs = inicializarTabs;
    
    console.log('✅ tabs.js cargado');
})();