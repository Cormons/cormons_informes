// ============================================
// UI HELPERS - Funciones de utilidad para manipulación de UI
// Dependencias: ninguna
// ============================================
(function() {
    'use strict';

    console.log('🎨 Cargando uiHelpers.js');

    /**
     * Mostrar u ocultar elemento usando clase d-none de Bootstrap
     *
     * @param {string|HTMLElement} selector - Selector CSS o elemento
     * @param {boolean} visible - true para mostrar, false para ocultar
     *
     * @example
     * UI.mostrar('#miElemento');
     * UI.mostrar('#miElemento', false); // oculta
     */
    function mostrarElemento(selector, visible = true) {
        const el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (el) {
            el.classList.toggle('d-none', !visible);
        }
    }

    /**
     * Ocultar elemento (alias de mostrarElemento con visible=false)
     *
     * @param {string|HTMLElement} selector - Selector CSS o elemento
     *
     * @example
     * UI.ocultar('#loading');
     */
    function ocultarElemento(selector) {
        mostrarElemento(selector, false);
    }

    /**
     * Mostrar estado de carga: oculta contenido, muestra loading
     *
     * @param {string} contenidoSelector - Selector del contenido principal
     * @param {string} loadingSelector - Selector del indicador de carga
     *
     * @example
     * UI.loading.mostrar('#resultados', '#loadingSpinner');
     */
    function mostrarLoading(contenidoSelector, loadingSelector) {
        mostrarElemento(contenidoSelector, false);
        mostrarElemento(loadingSelector, true);
    }

    /**
     * Ocultar estado de carga: muestra contenido, oculta loading
     *
     * @param {string} contenidoSelector - Selector del contenido principal
     * @param {string} loadingSelector - Selector del indicador de carga
     *
     * @example
     * UI.loading.ocultar('#resultados', '#loadingSpinner');
     */
    function ocultarLoading(contenidoSelector, loadingSelector) {
        mostrarElemento(loadingSelector, false);
        mostrarElemento(contenidoSelector, true);
    }

    /**
     * Establecer texto de un elemento
     *
     * @param {string|HTMLElement} selector - Selector CSS o elemento
     * @param {string} texto - Texto a establecer
     *
     * @example
     * UI.setText('#total', '$1,500.00');
     */
    function setText(selector, texto) {
        const el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (el) {
            el.textContent = texto;
        }
    }

    /**
     * Establecer HTML de un elemento
     *
     * @param {string|HTMLElement} selector - Selector CSS o elemento
     * @param {string} html - HTML a establecer
     *
     * @example
     * UI.setHTML('#contenedor', '<p>Contenido</p>');
     */
    function setHTML(selector, html) {
        const el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (el) {
            el.innerHTML = html;
        }
    }

    /**
     * Agregar/quitar clase CSS
     *
     * @param {string|HTMLElement} selector - Selector CSS o elemento
     * @param {string} clase - Nombre de la clase
     * @param {boolean} agregar - true para agregar, false para quitar
     *
     * @example
     * UI.toggleClass('#btn', 'active', true);
     */
    function toggleClass(selector, clase, agregar) {
        const el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (el) {
            el.classList.toggle(clase, agregar);
        }
    }

    /**
     * Deshabilitar/habilitar elemento (botón, input, etc.)
     *
     * @param {string|HTMLElement} selector - Selector CSS o elemento
     * @param {boolean} disabled - true para deshabilitar
     *
     * @example
     * UI.disabled('#btnGuardar', true);
     */
    function setDisabled(selector, disabled = true) {
        const el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (el) {
            el.disabled = disabled;
        }
    }

    /**
     * Ejecutar función con loading en botón
     * Deshabilita el botón y muestra spinner mientras ejecuta
     *
     * @param {HTMLElement} boton - Elemento botón
     * @param {Function} asyncFn - Función async a ejecutar
     * @returns {Promise<any>} - Resultado de la función
     *
     * @example
     * await UI.conLoadingEnBoton(btnGuardar, async () => {
     *     await guardarDatos();
     * });
     */
    async function conLoadingEnBoton(boton, asyncFn) {
        const textoOriginal = boton.innerHTML;
        const anchoOriginal = boton.offsetWidth;

        // Mantener ancho para evitar salto visual
        boton.style.minWidth = anchoOriginal + 'px';
        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            return await asyncFn();
        } finally {
            boton.disabled = false;
            boton.innerHTML = textoOriginal;
            boton.style.minWidth = '';
        }
    }

    /**
     * Obtener valor de input
     *
     * @param {string} selector - Selector CSS
     * @returns {string} - Valor del input (trim aplicado)
     *
     * @example
     * const codigo = UI.getValue('#inputCodigo');
     */
    function getValue(selector) {
        const el = document.querySelector(selector);
        return el ? el.value.trim() : '';
    }

    /**
     * Establecer valor de input
     *
     * @param {string} selector - Selector CSS
     * @param {string} valor - Valor a establecer
     *
     * @example
     * UI.setValue('#inputCodigo', '12345');
     */
    function setValue(selector, valor) {
        const el = document.querySelector(selector);
        if (el) {
            el.value = valor;
        }
    }

    /**
     * Limpiar valor de input
     *
     * @param {string} selector - Selector CSS
     *
     * @example
     * UI.clearValue('#inputCodigo');
     */
    function clearValue(selector) {
        setValue(selector, '');
    }

    /**
     * Focus en elemento
     *
     * @param {string} selector - Selector CSS
     *
     * @example
     * UI.focus('#inputBusqueda');
     */
    function focus(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.focus();
        }
    }

    // Exponer API pública
    window.UI = {
        // Visibilidad
        mostrar: mostrarElemento,
        ocultar: ocultarElemento,

        // Loading
        loading: {
            mostrar: mostrarLoading,
            ocultar: ocultarLoading
        },

        // Contenido
        setText: setText,
        setHTML: setHTML,

        // Clases
        toggleClass: toggleClass,

        // Estado
        disabled: setDisabled,
        conLoadingEnBoton: conLoadingEnBoton,

        // Inputs
        getValue: getValue,
        setValue: setValue,
        clearValue: clearValue,
        focus: focus
    };

    console.log('✅ uiHelpers.js cargado - UI.* disponible');
})();
