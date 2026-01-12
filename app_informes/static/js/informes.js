// ============================================
// INFORMES.JS - Inicialización general
// ============================================
(function() {
    'use strict';
    
    console.log('🔐 INICIANDO INFORMES JS');

    /**
     * Redirigir al login
     */
    function redirigirLogin() {
        window.location.href = 'https://cormons.app/';
    }

    // ============================================
    // INICIALIZACIÓN AL CARGAR DOM
    // ============================================
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM cargado - Inicializando...');
        
        const mensajeInicial = document.body.dataset.mensajeInicial;
        
        // mensajeInicial no está vacío (ni siquiera con espacios)
        if (mensajeInicial && mensajeInicial.trim() !== '') {
            mostrarAlerta(mensajeInicial, 'info-modal');
        }

        cargarPermisosModulos();
        inicializarTabs();
        
        console.log('✅ Informes.js inicializado correctamente');
    });

    // Exponer funciones globalmente
    window.redirigirLogin = redirigirLogin;
    
    console.log('✅ informes.js cargado');
})();