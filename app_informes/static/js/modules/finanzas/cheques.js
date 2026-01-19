// ============================================
// CHEQUES.JS - Lógica de cheques en cartera
// ============================================
(function() {
    'use strict';
    
    console.log('💰 Cargando cheques.js');

    /**
     * Consultar cheques en cartera
     */
    function consultarChequesCartera() {
        return fetch('/finanzas/cheques-cartera/')
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
                
                // Solo procesar y renderizar si HAY cheques
                if (data.CHEQUES && data.CHEQUES.length > 0) {
                    // Calcular totales generales
                    const totalCheques = data.CHEQUES.length;
                    const totalImporte = data.CHEQUES.reduce((sum, cheque) => 
                        sum + (parseFloat(cheque.importe) || 0), 0
                    );
                    
                    // Actualizar totales generales
                    document.getElementById('totalCantidad').textContent = 
                        `${totalCheques} ${totalCheques === 1 ? 'cheque' : 'cheques'}`;
                    document.getElementById('totalImporte').textContent = 
                        formatearMoneda(totalImporte);
                    
                    // Resetear totales seleccionados
                    document.getElementById('seleccionadosCantidad').textContent = '0 cheques';
                    document.getElementById('seleccionadosImporte').textContent = '$0.00';
                    
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
                            ? '<span class="badge bg-info ms-1">Cruzado</span>' 
                            : '';
                        
                        const chequeDiv = document.createElement('div');
                        chequeDiv.className = 'cheque-row';
                        chequeDiv.dataset.index = index;
                        chequeDiv.dataset.importe = importe;
                        chequeDiv.innerHTML = `
                            <div class="cheque-row-main">
                                <!-- Primera línea: Checkbox + Fecha + Importe -->
                                <div class="cheque-row-header">
                                    <div class="cheque-row-left">
                                        <input type="checkbox" class="cheque-checkbox" data-index="${index}">
                                        <i class="fas fa-chevron-right cheque-expand-icon" id="icon-${index}"></i>
                                        <div class="cheque-fecha">${cheque.fechaCobro || '-'}</div>
                                    </div>
                                    <div class="cheque-importe">${formatearMoneda(importe)}</div>
                                </div>
                                <!-- Segunda línea: Emisor -->
                                <div class="cheque-emisor">${cheque.emisor || '-'}</div>
                            </div>
                            <div class="cheque-details" id="details-${index}">
                                <div class="cheque-detail-item">
                                    <span class="cheque-detail-label"><i class="fas fa-university me-1"></i>Banco</span>
                                    <span class="cheque-detail-value">${cheque.banco || '-'}</span>
                                </div>
                                <div class="cheque-detail-item">
                                    <span class="cheque-detail-label"><i class="fas fa-hashtag me-1"></i>Nº Cheque</span>
                                    <span class="cheque-detail-value">${cheque.nroCheque || '-'}</span>
                                </div>
                                <div class="cheque-badges">
                                    ${badgeEcheq}${badgeCruzado}
                                </div>
                            </div>
                        `;
                        
                        // Event listener para checkbox
                        const checkbox = chequeDiv.querySelector('.cheque-checkbox');
                        checkbox.addEventListener('change', actualizarTotalesSeleccionados);
                        
                        // Event listener para expandir/colapsar
                        chequeDiv.querySelector('.cheque-expand-icon').addEventListener('click', () => {
                            const details = document.getElementById(`details-${index}`);
                            const icon = document.getElementById(`icon-${index}`);
                            
                            details.classList.toggle('expanded');
                            icon.classList.toggle('expanded');
                        });
                        
                        lista.appendChild(chequeDiv);
                    });
                    
                    // Guardar datos de cheques globalmente para copiar
                    window.chequesData = data.CHEQUES;
                    
                    // Event listener para botón copiar
                    document.getElementById('btnCopiarSeleccionados').onclick = copiarChequesSeleccionados;
                    document.getElementById('checkboxSeleccionarTodos').addEventListener('change', toggleSeleccionarTodos);
                    
                    // ✅ MOSTRAR MENSAJE DE VFP SI EXISTE (como modal independiente)
                    if (data.Mensaje && data.Mensaje.trim() !== '') {
                        // Esperar a que el modal de cheques se renderice completamente
                        setTimeout(() => {
                            mostrarAlerta(data.Mensaje, 'info-modal');
                        }, 500);
                    }
                    
                    // Mostrar resultados
                    document.getElementById('chequesResultados').classList.remove('d-none');
                }

                // SIEMPRE devolver data (modales.js decide qué hacer)
                return data;
            })
            .catch(error => {
                console.error('❌ Error al consultar cheques:', error);
                document.getElementById('chequesLoading').classList.add('d-none');

                // Propagar el error para que modales.js lo maneje
                throw error;
            });
    }

    /**
     * Actualizar totales de cheques seleccionados
     */
    function actualizarTotalesSeleccionados() {
        const checkboxes = document.querySelectorAll('.cheque-checkbox:checked');
        const totalCheckboxes = document.querySelectorAll('.cheque-checkbox');
        const cantidad = checkboxes.length;
        
        let importeTotal = 0;
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('.cheque-row');
            const importe = parseFloat(row.dataset.importe) || 0;
            importeTotal += importe;
        });
        
        // Actualizar UI
        document.getElementById('seleccionadosCantidad').textContent = `${cantidad} ${cantidad === 1 ? 'cheque' : 'cheques'}`;
        document.getElementById('seleccionadosImporte').textContent = formatearMoneda(importeTotal);
        
        // Habilitar/deshabilitar botón copiar
        document.getElementById('btnCopiarSeleccionados').disabled = cantidad === 0;
        
        // 🆕 Actualizar estado del checkbox "Seleccionar todos"
        const checkboxMaster = document.getElementById('checkboxSeleccionarTodos');
        if (checkboxMaster) {
            checkboxMaster.checked = cantidad === totalCheckboxes.length && cantidad > 0;
            checkboxMaster.indeterminate = cantidad > 0 && cantidad < totalCheckboxes.length;
        }
    }
    /**
     * Seleccionar/deseleccionar todos los cheques
     */
    function toggleSeleccionarTodos() {
        const checkboxMaster = document.getElementById('checkboxSeleccionarTodos');
        const checkboxes = document.querySelectorAll('.cheque-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkboxMaster.checked;
        });
        
        actualizarTotalesSeleccionados();
    }

    /**
     * Copiar cheques seleccionados al portapapeles (formato WhatsApp)
     */
    function copiarChequesSeleccionados() {
        const checkboxes = document.querySelectorAll('.cheque-checkbox:checked');
        
        if (checkboxes.length === 0) {
            alert('No hay cheques seleccionados');
            return;
        }
        
        let texto = '📋 *Cheques Seleccionados*\n\n';
        let importeTotal = 0;
        
        checkboxes.forEach((checkbox, i) => {
            const index = parseInt(checkbox.dataset.index);
            const cheque = window.chequesData[index];
            const importe = parseFloat(cheque.importe) || 0;
            importeTotal += importe;
            
            texto += `✅ *Cheque ${i + 1}*\n`;
            texto += `📅 Fecha: ${cheque.fechaCobro || '-'}\n`;
            texto += `👤 Emisor: ${cheque.emisor || '-'}\n`;
            texto += `🏦 Banco: ${cheque.banco || '-'}\n`;
            texto += `🔢 Nº: ${cheque.nroCheque || '-'}\n`;
            texto += `💰 Importe: ${formatearMoneda(importe)}\n`;
            
            if (cheque.eCheq === 'SI') texto += `ℹ️ eCheq\n`;
            if (cheque.cruzado === 'SI') texto += `ℹ️ Cruzado\n`;
            
            texto += '\n';
        });
        
        texto += '━━━━━━━━━━━━━━━━━━━━\n';
        texto += `📊 Total: ${checkboxes.length} ${checkboxes.length === 1 ? 'cheque' : 'cheques'}\n`;
        texto += `💵 Suma: ${formatearMoneda(importeTotal)}`;
        
        // Copiar al portapapeles
        navigator.clipboard.writeText(texto).then(() => {
            // Cambiar temporalmente el botón
            const btn = document.getElementById('btnCopiarSeleccionados');
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check me-1"></i>¡Copiado!';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-primary');
            
            setTimeout(() => {
                btn.innerHTML = textoOriginal;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar:', err);
            alert('Error al copiar al portapapeles');
        });
    }

    // Exponer funciones globalmente
    window.consultarChequesCartera = consultarChequesCartera;
    
    console.log('✅ cheques.js cargado');
})();