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

    /**
     * Flujo de inicialización SECUENCIAL
     */
    async function inicializarAplicacion() {
        console.log('🚀 DOM cargado - Inicializando...');
        
        // ✅ PASO 1: Mostrar mensaje de verificarToken (si existe)
        const mensajeInicial = document.body.dataset.mensajeInicial;
        if (mensajeInicial && mensajeInicial.trim() !== '') {
            console.log('📢 Mensaje de verificarToken:', mensajeInicial);
            await mostrarAlerta(mensajeInicial, 'info-modal');
            console.log('✅ Usuario aceptó mensaje de verificarToken');
        }
        
        // ✅ PASO 2: Cargar permisos y mostrar mensaje (si existe)
        try {
            const mensajePermisos = await cargarPermisosModulos();
            if (mensajePermisos && mensajePermisos.trim() !== '') {
                console.log('📢 Mensaje de permisos:', mensajePermisos);
                await mostrarAlerta(mensajePermisos, 'info-modal');
                console.log('✅ Usuario aceptó mensaje de permisos');
            }
        } catch (error) {
            console.error('❌ Error cargando permisos:', error);
            return; // Detener ejecución si falla
        }
        
        // ✅ PASO 3: Inicializar tabs (usuario ya puede interactuar)
        inicializarTabs();
        
        console.log('✅ Informes.js inicializado correctamente');
    }

    // ============================================
    // INICIALIZACIÓN AL CARGAR DOM
    // ============================================
    
    document.addEventListener('DOMContentLoaded', inicializarAplicacion);

    // Exponer funciones globalmente
    window.redirigirLogin = redirigirLogin;
    
    console.log('✅ informes.js cargado');
})();