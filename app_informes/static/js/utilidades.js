// ============================================
// UTILIDADES.JS - Funciones de utilidad compartidas
// ============================================
(function() {
    'use strict';
    
    console.log('🔧 Cargando utilidades.js');

    /**
     * Formatear número como moneda
     */
    function formatearMoneda(valor) {
        if (!valor && valor !== 0) return '$0.00';
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(valor);
    }

    /**
     * Obtener cookie por nombre
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Exponer funciones globalmente
    window.formatearMoneda = formatearMoneda;
    window.getCookie = getCookie;
    
    console.log('✅ utilidades.js cargado');
})();