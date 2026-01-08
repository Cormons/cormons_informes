// Cookies de prueba
 document.cookie = 'authToken=2512231204320  _7CS0PVR7W; path=/; max-age=3600';
 document.cookie = 'user_usuario=A; path=/; max-age=3600';
 document.cookie = 'empresa_ip = "servidorseguro.serinformatica.ar"; path=/; max-age=3600';
 document.cookie = 'empresa_nombre = "servidor cormons"; path=/; max-age=3600';
 document.cookie = 'empresa_puerto = 51122; path=/; max-age=3600';
//informes.js
// Sistema de informes - Módulo de Cajas (Cheques en Cartera)
(function() {
    console.log("🔐 INICIANDO INFORMES JS");

    // Variables globales
    let modalChequesCartera = null;
    let modalErrorBloqueante = null;

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Obtiene el valor de una cookie
     */
    // function getCookie(name) {
    //     const value = `; ${document.cookie}`;
    //     const parts = value.split(`; ${name}=`);
    //     if (parts.length === 2) return parts.pop().split(';').shift();
    //     return null;
    // }

    /**
     * Formatea números como moneda argentina
     */
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(valor);
    }

    /**
     * Formatea fechas en formato DD/MM/YYYY
     */
    function formatearFecha(fechaStr) {
        if (!fechaStr) return '-';
        
        // Si viene en formato YYYY-MM-DD
        const partes = fechaStr.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        
        return fechaStr;
    }

    /**
     * Obtiene el color del badge según el estado del cheque
     */
    function obtenerColorEstado(estado) {
        const estadoLower = (estado || '').toLowerCase();
        
        if (estadoLower.includes('depositado') || estadoLower.includes('cobrado')) {
            return 'success';
        }
        if (estadoLower.includes('vencido')) {
            return 'danger';
        }
        if (estadoLower.includes('rechazado')) {
            return 'warning';
        }
        
        return 'secondary'; // Pendiente/Cartera
    }

    // ============================================
    // MODALES
    // ============================================

    /**
     * Inicializar modales de Bootstrap
     */
    function inicializarModales() {
        const modalChequesElement = document.getElementById('modalChequesCartera');
        if (modalChequesElement && window.bootstrap) {
            modalChequesCartera = new bootstrap.Modal(modalChequesElement);
            console.log('✅ Modal de cheques inicializado');
        }

        const modalErrorElement = document.getElementById('modalErrorBloqueante');
        if (modalErrorElement && window.bootstrap) {
            modalErrorBloqueante = new bootstrap.Modal(modalErrorElement, {
                backdrop: 'static',
                keyboard: false
            });
            console.log('✅ Modal de error bloqueante inicializado');
        }
    }

    /**
     * Muestra modal de error bloqueante (sesión expirada)
     */
    function mostrarErrorBloqueante(mensaje, redirectUrl) {
        console.log('🚫 Mostrando error bloqueante:', mensaje);
        
        const mensajeEl = document.getElementById('errorBloqueanteTexto');
        const btnRedirect = document.getElementById('btn-redirect-bloqueante');
        
        if (mensajeEl) {
            mensajeEl.textContent = mensaje;
        }
        
        if (btnRedirect) {
            btnRedirect.onclick = function() {
                window.location.href = redirectUrl || 'https://cormons.app/';
            };
        }
        
        if (modalErrorBloqueante) {
            modalErrorBloqueante.show();
        } else {
            // Fallback
            alert(mensaje);
            window.location.href = redirectUrl || 'https://cormons.app/';
        }
    }

    /**
     * Muestra mensaje informativo de VFP (no bloqueante, pero modal)
     */
    function mostrarMensajeInfo(mensaje) {
        if (!mensaje || mensaje.trim() === '') return;
        
        console.log('📢 Mensaje de VFP:', mensaje);
        
        const infoDiv = document.getElementById('chequesMensajeInfo');
        const infoTexto = document.getElementById('chequesMensajeInfoTexto');
        
        if (infoDiv && infoTexto) {
            infoTexto.textContent = mensaje;
            infoDiv.classList.remove('d-none');
        }
    }

    /**
     * Muestra error en el modal de cheques
     */
    function mostrarErrorCheques(mensaje) {
        console.error('❌ Error en cheques:', mensaje);
        
        const errorDiv = document.getElementById('chequesError');
        const errorMensaje = document.getElementById('chequesErrorMensaje');
        
        if (errorDiv && errorMensaje) {
            errorMensaje.textContent = mensaje;
            errorDiv.classList.remove('d-none');
        }
    }

    // ============================================
    // CHEQUES EN CARTERA
    // ============================================

    /**
     * Abre modal y consulta cheques
     */
    function abrirModalChequesCartera() {
        console.log('🔵 Abriendo modal de cheques...');
        
        if (!modalChequesCartera) {
            console.error('❌ Modal de cheques no inicializado');
            alert('Error al abrir modal de cheques');
            return;
        }
        
        // Abrir modal
        modalChequesCartera.show();
        
        // Resetear estado del modal
        document.getElementById('chequesLoading').classList.remove('d-none');
        document.getElementById('chequesError').classList.add('d-none');
        document.getElementById('chequesMensajeInfo').classList.add('d-none');
        document.getElementById('chequesResultados').classList.add('d-none');
        
        // Hacer petición AJAX
        consultarChequesCartera();
    }

    /**
     * Realiza consulta AJAX de cheques en cartera
     */
    function consultarChequesCartera() {
        console.log('📡 Consultando cheques en cartera...');
        
        fetch('/cheques-cartera/', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(resp => {
            // Si es 401 o 404, puede ser falta de autenticación
            if (resp.status === 401 || resp.status === 404) {
                // Cerrar modal de cheques inmediatamente (antes de parsear JSON)
                if (modalChequesCartera) {
                    modalChequesCartera.hide();
                }
                // También ocultar forzadamente usando clases de Bootstrap
                const modalElement = document.getElementById('modalChequesCartera');
                if (modalElement) {
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }
                
                return resp.json().then(data => {
                    console.log('🚫 Sesión inválida o ruta no encontrada - redirigiendo al login');
                    const redirectUrl = data.redirect || 'https://cormons.app/login/?logout=1';
                    const mensaje = data.error || data.mensaje || 'Sesión expirada. Por favor, inicie sesión nuevamente.';

                    // Mostrar modal de error bloqueante
                    mostrarErrorBloqueante(mensaje, redirectUrl);
                    throw new Error('Sesión inválida');
                }).catch(err => {
                    // Si ya lanzamos 'Sesión inválida', re-lanzarlo
                    if (err.message === 'Sesión inválida') {
                        throw err;
                    }
                    // Si el 404 no devuelve JSON (página de error de Django), redirigir igual
                    if (resp.status === 404) {
                        console.log('🚫 Ruta no encontrada - redirigiendo al login');
                        mostrarErrorBloqueante(
                            'No se encontró la ruta solicitada. Por favor, inicie sesión nuevamente.',
                            'https://cormons.app/login/?logout=1'
                        );
                        throw new Error('Ruta no encontrada');
                    }
                    // Para 401 que no pudo parsear JSON, tratar como sesión inválida
                    if (resp.status === 401) {
                        console.log('🚫 Error 401 - redirigiendo al login');
                        mostrarErrorBloqueante(
                            'Sesión expirada. Por favor, inicie sesión nuevamente.',
                            'https://cormons.app/login/?logout=1'
                        );
                        throw new Error('Sesión inválida');
                    }
                    // Cualquier otro error de autenticación también es sesión inválida
                    throw new Error('Sesión inválida');
                });
            }
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            console.log('📡 Cheques recibidos:', data);

            // Ocultar loading
            document.getElementById('chequesLoading').classList.add('d-none');

            // Si VFP devolvió error, mostrarlo
            if (data.error) {
                // Usar mensaje de VFP
                mostrarErrorCheques(data.error);
                return;
            }

            // Mostrar mensaje informativo si VFP lo envió
            if (data.mensaje) {
                mostrarMensajeInfo(data.mensaje);
            }

            // Verificar si hay cheques
            const cheques = data.chequesCartera || [];
            if (cheques.length === 0) {
                mostrarErrorCheques('No se encontraron cheques en cartera');
                return;
            }

            // Renderizar tabla de cheques
            renderizarTablaCheques(cheques);
        })
        .catch(err => {
            console.error('❌ Error al consultar cheques:', err);
            // No mostrar error si ya estamos redirigiendo o si el modal ya se cerró
            if (err.message !== 'Sesión inválida' && err.message !== 'Ruta no encontrada') {
                // Solo mostrar error si el modal de cheques todavía está abierto
                const modalElement = document.getElementById('modalChequesCartera');
                if (modalElement && modalElement.classList.contains('show')) {
                    document.getElementById('chequesLoading').classList.add('d-none');
                    mostrarErrorCheques('Error de comunicación. Intente nuevamente.');
                }
            } else {
                // Asegurarse de que el modal esté cerrado cuando hay error de sesión
                if (modalChequesCartera) {
                    modalChequesCartera.hide();
                }
            }
        });
    }

    /**
     * Renderiza la tabla de cheques
     */
    function renderizarTablaCheques(cheques) {
        console.log(`✅ Renderizando ${cheques.length} cheques`);
        
        const tbody = document.getElementById('chequesTableBody');
        if (!tbody) {
            console.error('❌ No se encontró tbody de cheques');
            return;
        }
        
        tbody.innerHTML = '';
        
        let totalMonto = 0;
        
        cheques.forEach(cheque => {
            const row = document.createElement('tr');
            
            const monto = parseFloat(cheque.monto) || 0;
            totalMonto += monto;
            
            row.innerHTML = `
                <td>${cheque.numero || '-'}</td>
                <td>${formatearFecha(cheque.fecha_emision)}</td>
                <td>${formatearFecha(cheque.fecha_vencimiento)}</td>
                <td>${cheque.banco || '-'}</td>
                <td>${cheque.cliente || '-'}</td>
                <td class="text-end">${formatearMoneda(monto)}</td>
                <td>
                    <span class="badge bg-${obtenerColorEstado(cheque.estado)}">
                        ${cheque.estado || 'Pendiente'}
                    </span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Actualizar resumen
        document.getElementById('chequesTotalCantidad').textContent = cheques.length;
        document.getElementById('chequesTotalMonto').textContent = formatearMoneda(totalMonto);
        
        // Mostrar resultados
        document.getElementById('chequesResultados').classList.remove('d-none');
    }

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
                const modulosPermitidos = data.informes;
                
                document.querySelectorAll('.module-tab').forEach(btn => {
                    const modulo = btn.dataset.module;
                    
                    if (modulosPermitidos.includes(modulo)) {
                        btn.disabled = false;
                        btn.classList.remove('btn-outline-secondary');
                        btn.classList.add('btn-outline-warning');
                    }
                });
                
                const primerPermitido = document.querySelector(`.module-tab[data-module="${modulosPermitidos[0]}"]`);
                if (primerPermitido) {
                    primerPermitido.classList.add('active');
                    primerPermitido.click();
                }
            })
            .catch(err => {
                console.error('Error al cargar permisos:', err);
                // 🆕 USAR TU MODAL BLOQUEANTE (sin redirección para que solo informe)
                mostrarErrorBloqueante('Error al cargar permisos de módulos:\n\n' + err.message, null);
            });
    }

    // ============================================
    // CERRAR SESIÓN
    // ============================================

    // async function cerrarSesion() {
    //     if (!confirm('¿Está seguro que desea cerrar sesión?')) {
    //         return;
    //     }

    //     const csrftoken = getCookie('csrftoken');

    //     try {
    //         const response = await fetch('/logout/', {
    //             method: 'POST',
    //             headers: {
    //                 'X-CSRFToken': csrftoken,
    //                 'Content-Type': 'application/json'
    //             },
    //             credentials: 'same-origin'
    //         });

    //         // Redirigir siempre al login (éxito o error)
    //         window.location.href = 'https://cormons.app/';
            
    //     } catch (error) {
    //         console.error('❌ Error al cerrar sesión:', error);
    //         // Redirigir de todos modos
    //         window.location.href = 'https://cormons.app/';
    //     }
    // }

    /**
     * Redirige al login (usado por el modal de error bloqueante)
     */
    function redirigirLogin() {
        window.location.href = 'https://cormons.app/';
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    /**
     * Inicializar tabs de Bootstrap
     */
    function inicializarTabs() {
        const tabButtons = document.querySelectorAll('.module-tab');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', function(event) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
            });
        });
        console.log('✅ Tabs inicializados');
    }

    /**
     * Inicialización al cargar el DOM
     */
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM cargado - Inicializando...');
        
        // 🆕 LLAMAR A LA NUEVA FUNCIÓN AQUÍ
        cargarPermisosModulos();
        
        inicializarModales();
        inicializarTabs();
        
        console.log('✅ Informes.js inicializado correctamente');
    });

    // ============================================
    // EXPONER FUNCIONES GLOBALES
    // ============================================

    window.abrirModalChequesCartera = abrirModalChequesCartera;
    window.mostrarErrorBloqueante = mostrarErrorBloqueante;
    //window.cerrarSesion = cerrarSesion;
    window.redirigirLogin = redirigirLogin;

    console.log('✅ informes.js cargado');
})();