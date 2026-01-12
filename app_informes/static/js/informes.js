// ============================================
// INFORMES.JS - Lógica específica de informes
// ============================================
(function() {
    'use strict';
    
    console.log('🔐 INICIANDO INFORMES JS');

    // ============================================
    // UTILIDADES
    // ============================================
    
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

    // ============================================
    // PERMISOS DE MÓDULOS
    // ============================================
    
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
                    btn.classList.add(`module-${modulo}-enabled`);  // ✅ Corregido
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

    // ============================================
    // CHEQUES EN CARTERA
    // ============================================
        
    /**
     * Consultar cheques en cartera OFICIAL
     */
    // function consultarChequesCartera() {
    //     fetch('/cheques-cartera/')
    //         .then(response => {
    //             if (!response.ok) {
    //                 return response.json().then(err => {
    //                     throw new Error(err.error || 'Error en la respuesta del servidor');
    //                 });
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             console.log('📦 Datos recibidos:', data);
    //             
    //             // Ocultar loading
    //             document.getElementById('chequesLoading').classList.add('d-none');
    //             
    //             // Mostrar mensaje informativo si existe
    //             if (data.mensaje && data.mensaje.trim() !== '') {
    //                 mostrarMensajeInfoCheques(data.mensaje);
    //             }
    //             
    //             // Verificar si hay cheques
    //             if (!data.cheques || data.cheques.length === 0) {
    //                 mostrarErrorCheques('No se encontraron cheques en cartera');
    //                 return;
    //             }
    //             
    //             // Renderizar tabla
    //             const tbody = document.getElementById('chequesTableBody');
    //             tbody.innerHTML = '';
    //             
    //             data.cheques.forEach(cheque => {
    //                 const row = document.createElement('tr');
    //                 const monto = parseFloat(cheque.monto) || 0;
    //                 
    //                 row.innerHTML = `
    //                     <td>${cheque.numero || '-'}</td>
    //                     <td>${cheque.fecha_emision || '-'}</td>
    //                     <td>${cheque.fecha_vencimiento || '-'}</td>
    //                     <td>${cheque.banco || '-'}</td>
    //                     <td>${cheque.cliente || '-'}</td>
    //                     <td class="text-end">${formatearMoneda(monto)}</td>
    //                     <td><span class="badge bg-success">${cheque.estado || 'En cartera'}</span></td>
    //                 `;
    //                 tbody.appendChild(row);
    //             });
    //             
    //             // Mostrar resultados
    //             document.getElementById('chequesResultados').classList.remove('d-none');
    //         })
    //         .catch(error => {
    //             console.error('❌ Error al consultar cheques:', error);
    //             document.getElementById('chequesLoading').classList.add('d-none');
    //             mostrarErrorCheques(error.message || 'Error al consultar cheques');
    //         });
    // }


    /**
     * Consultar cheques en cartera PRUEBA
     */
    function consultarChequesCartera() {
        fetch('/cheques-cartera/')
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Error en la respuesta del servidor');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('📦 Datos recibidos:', data);
                
                // Ocultar loading
                document.getElementById('chequesLoading').classList.add('d-none');
                
                // Mostrar mensaje informativo si existe
                if (data.Mensaje && data.Mensaje.trim() !== '') {
                    mostrarMensajeInfoCheques(data.Mensaje);
                }
                
                // Verificar si hay cheques
                if (!data.CHEQUES || data.CHEQUES.length === 0) {
                    mostrarErrorCheques('No se encontraron cheques en cartera');
                    return;
                }
                
                // Renderizar lista expandible
                const lista = document.getElementById('chequesListaExpandible');
                lista.innerHTML = '';
                
                data.CHEQUES.forEach((cheque, index) => {
                    const importe = parseFloat(cheque.importe) || 0;
                    
                    // Badge para eCheq
                    const badgeEcheq = cheque.eCheq === 'SI' 
                        ? '<span class="badge bg-info ms-1">eCheq</span>' 
                        : '';
                    
                    // Badge para cruzado
                    const badgeCruzado = cheque.cruzado === 'SI' 
                        ? '<span class="badge bg-secondary ms-1">Cruzado</span>' 
                        : '';
                    
                    const chequeDiv = document.createElement('div');
                    chequeDiv.className = 'cheque-row';
                    chequeDiv.innerHTML = `
                        <div class="cheque-row-main">
                            <i class="fas fa-chevron-right cheque-expand-icon" id="icon-${index}"></i>
                            <div class="cheque-fecha">${cheque.fechaCobro || '-'}</div>
                            <div class="cheque-emisor">${cheque.emisor || '-'}</div>
                            <div class="cheque-importe">${formatearMoneda(importe)}</div>
                        </div>
                        <div class="cheque-details" id="details-${index}">
                            <div class="cheque-detail-item">
                                <span class="cheque-detail-label">Banco:</span>
                                <span>${cheque.banco || '-'}</span>
                            </div>
                            <div class="cheque-detail-item">
                                <span class="cheque-detail-label">Nº Cheque:</span>
                                <span>${cheque.nroCheque || '-'}</span>
                            </div>
                            <div class="cheque-badges">
                                ${badgeEcheq}${badgeCruzado}
                            </div>
                        </div>
                    `;
                    
                    // Event listener para expandir/colapsar
                    chequeDiv.querySelector('.cheque-row-main').addEventListener('click', () => {
                        const details = document.getElementById(`details-${index}`);
                        const icon = document.getElementById(`icon-${index}`);
                        
                        details.classList.toggle('expanded');
                        icon.classList.toggle('expanded');
                    });
                    
                    lista.appendChild(chequeDiv);
                });
                
                // Mostrar resultados
                document.getElementById('chequesResultados').classList.remove('d-none');
            })
            .catch(error => {
                console.error('❌ Error al consultar cheques:', error);
                document.getElementById('chequesLoading').classList.add('d-none');
                mostrarErrorCheques(error.message || 'Error al consultar cheques');
            });
    }

    // ============================================
    // TABS
    // ============================================
    

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

    // ============================================
    // NAVEGACIÓN
    // ============================================
    
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

    // ============================================
    // EXPONER FUNCIONES GLOBALES
    // ============================================
    
    window.consultarChequesCartera = consultarChequesCartera;
    window.redirigirLogin = redirigirLogin;
    
    console.log('✅ informes.js cargado');
})();