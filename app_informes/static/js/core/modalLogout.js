// ============================================
// MODAL LOGOUT - Modal de confirmación de cierre de sesión
// Dependencias: utilidades.js 
// ============================================

// Función para cargar el modal de logout
function loadLogoutModal() {
    const modalHTML = `
    <div class="modal fade" id="modalLogout" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center py-4">
                    <i class="fas fa-exclamation-circle text-warning" style="font-size: 3rem;"></i>
                    <p class="mt-3 mb-0 fs-5">¿Está seguro que desea cerrar sesión?</p>
                </div>
                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-danger" onclick="confirmarLogout()">
                        <i class="fas fa-sign-out-alt me-1"></i>Salir
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Insertar el modal al final del body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para cerrar sesión (con modal)
function cerrarSesion() {
    const modal = new bootstrap.Modal(document.getElementById('modalLogout'));
    modal.show();
}

// Función de confirmación del logout
async function confirmarLogout() {
    try {
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        window.location.href = '/logout/';

    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        window.location.href = '/logout/';
    }
}

// Cargar el modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadLogoutModal);