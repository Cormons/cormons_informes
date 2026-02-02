// ============================================
// VFP CLIENT - Cliente centralizado para comunicación con VFP
// Dependencias: utilidades.js (getCookie), modales.js (mostrarAlerta, mostrarErrorBloqueante)
// ============================================
(function() {
    'use strict';

    console.log('🔌 Cargando vfpClient.js');

    // Estados posibles de respuesta VFP
    const ESTADOS = {
        EXITO: 'exito',
        ERROR: 'error',
        NO_AUTH: 'no_auth',
        SIN_DATOS: 'sin_datos'
    };

    /**
     * Cliente centralizado para llamadas a VFP via Django
     *
     * @param {string} url - Endpoint Django
     * @param {Object} options - Opciones de fetch (method, body, etc.)
     * @returns {Promise<{estado: string, datos: any, mensaje: string}>}
     *
     * @example
     * const resultado = await VFP.fetch('/finanzas/cheques-cartera/');
     * // resultado = { estado: 'exito', datos: { CHEQUES: [...] }, mensaje: '' }
     */
    async function vfpFetch(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'same-origin'
        };

        // Merge de opciones
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            // HTTP 401 = Sesión expirada
            if (response.status === 401) {
                return {
                    estado: ESTADOS.NO_AUTH,
                    datos: null,
                    mensaje: data.error || 'Sesión expirada'
                };
            }

            // HTTP 400+ = Error de VFP o servidor
            if (!response.ok) {
                return {
                    estado: ESTADOS.ERROR,
                    datos: null,
                    mensaje: data.error || data.mensaje || 'Error del servidor'
                };
            }

            // Detectar si hay datos en la respuesta
            const tieneDatos = detectarDatosEnRespuesta(data);

            return {
                estado: tieneDatos ? ESTADOS.EXITO : ESTADOS.SIN_DATOS,
                datos: data,
                mensaje: data.Mensaje || data.mensaje || ''
            };

        } catch (error) {
            console.error('❌ VFP.fetch error:', error);
            return {
                estado: ESTADOS.ERROR,
                datos: null,
                mensaje: 'Error de conexión con el servidor'
            };
        }
    }

    /**
     * Detecta si la respuesta VFP contiene datos reales
     * Revisa los patrones comunes de respuesta VFP
     */
    function detectarDatosEnRespuesta(data) {
        // Patrones conocidos de respuesta VFP con datos
        if (data.CHEQUES && data.CHEQUES.length > 0) return true;
        if (data.CLIENTES && data.CLIENTES.length > 0) return true;
        if (data.CLIENTE) return true;
        if (data.PRODUCTOS && data.PRODUCTOS.length > 0) return true;
        if (data.informes && data.informes.length > 0) return true;

        // Si no matchea ningún patrón conocido, asumir que hay datos
        // si el objeto tiene propiedades además de Mensaje/mensaje
        const keys = Object.keys(data).filter(k =>
            k.toLowerCase() !== 'mensaje'
        );
        return keys.length > 0;
    }

    /**
     * Handler estándar para respuestas VFP
     * Ejecuta el callback apropiado según el estado
     *
     * @param {Object} resultado - Resultado de vfpFetch
     * @param {Object} handlers - Callbacks: { onExito, onError, onNoAuth, onSinDatos }
     * @returns {Promise<any>} - Retorna lo que devuelva onExito, o undefined
     *
     * @example
     * await VFP.manejar(resultado, {
     *     onExito: (datos) => procesarCheques(datos.CHEQUES),
     *     onSinDatos: (msg) => console.log('No hay cheques'),
     *     onError: (msg) => mostrarError(msg)
     * });
     */
    async function manejarRespuestaVFP(resultado, handlers = {}) {
        const { estado, datos, mensaje } = resultado;

        switch (estado) {
            case ESTADOS.NO_AUTH:
                if (handlers.onNoAuth) {
                    handlers.onNoAuth(mensaje);
                } else {
                    // Comportamiento por defecto: redirigir a logout
                    console.warn('⚠️ Sesión expirada, redirigiendo...');
                    if (window.mostrarErrorBloqueante) {
                        window.mostrarErrorBloqueante(mensaje);
                    } else {
                        window.location.href = '/logout/';
                    }
                }
                return;

            case ESTADOS.ERROR:
                if (handlers.onError) {
                    handlers.onError(mensaje);
                } else {
                    // Comportamiento por defecto: mostrar alerta de error
                    if (window.mostrarAlerta) {
                        await window.mostrarAlerta(mensaje, 'error-modal');
                    } else {
                        console.error('❌ Error VFP:', mensaje);
                    }
                }
                return;

            case ESTADOS.SIN_DATOS:
                // Mostrar mensaje de VFP si existe (antes del callback)
                if (mensaje && window.mostrarAlerta) {
                    await window.mostrarAlerta(mensaje, 'info-modal');
                }
                if (handlers.onSinDatos) {
                    handlers.onSinDatos(mensaje);
                }
                return;

            case ESTADOS.EXITO:
                // Mostrar mensaje de VFP si existe (antes del callback)
                if (mensaje && window.mostrarAlerta) {
                    await window.mostrarAlerta(mensaje, 'info-modal');
                }
                if (handlers.onExito) {
                    return handlers.onExito(datos);
                }
                return datos;
        }
    }

    // Exponer API pública
    window.VFP = {
        fetch: vfpFetch,
        manejar: manejarRespuestaVFP,
        ESTADOS: ESTADOS
    };

    console.log('✅ vfpClient.js cargado - VFP.fetch() disponible');
})();
