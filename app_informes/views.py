from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
import json
from .utils import obtener_datos_cookies, renderizar_error, borrar_cookies_sesion
from .services import comando_verificarToken, comando_chequesCartera, comando_permisosInformes

@ensure_csrf_cookie
def informes_view(request):
    print("==== INFORMES VIEW INICIANDO ====")

    # 1) Cookies
    token, datos_conexion, usuario_cookie, error_mensaje = obtener_datos_cookies(request)

    # Obtener nombre de empresa para mensajes de error
    empresa_nombre = datos_conexion.get('nombre', '') if datos_conexion else ''

    # Si hay un error, mostrar mensaje específico
    if error_mensaje:
        print(f"❌ REDIRIGIENDO - {error_mensaje}")
        return renderizar_error(
            request,
            error_mensaje,
            empresa_nombre,
            redirect_to='https://cormons.app/'
        )

    empresa_nombre = datos_conexion.get('nombre', 'EmpresaDefault')

    # 2) Verificar token
    verificarToken = comando_verificarToken(token, request)

    print(f"📡 Respuesta verificarToken: {verificarToken}")

    if not verificarToken["estado"]:
        mensaje = verificarToken.get("mensaje", "Token inválido")
        # Limpiar sesión
        request.session.flush()
        # Mostrar error - usuario debe presionar Aceptar para redirigir
        return renderizar_error(request, mensaje, empresa_nombre, redirect_to='https://cormons.app/')

    usuario = verificarToken["usuario"]
    nombre = verificarToken["nombre"]
    mensaje_vfp = verificarToken.get("mensaje", "")  # Capturar mensaje de VFP si existe

    print(f"✅ Usuario verificado: {usuario}")
    if mensaje_vfp:
        print(f"📢 VFP envió mensaje: {mensaje_vfp}")

    # 3) Renderizar inmediatamente con spinner
    # Los pendientes se cargarán con AJAX después
    print("🚀 Renderizando template inmediatamente (pendientes se cargan con AJAX)")

    return render(request, "app_informes/informes.html", {
        #"pendientes": [],  # Vacío, se cargará con AJAX
        "empresa_nombre": empresa_nombre,
        "usuario": usuario,
        "nombre": nombre,
        "deposito": "",  # Se cargará con AJAX
        "error": False,
        #"loading_pendientes": True,  # Flag para mostrar spinner y auto-cargar
        "mensaje_inicial": mensaje_vfp,  # Mensaje de VFP al verificar token
    })

def chequesCartera_view(request):
    """
    Endpoint JSON que verifica token y devuelve la lista de cheques en cartera.
    Método: GET
    Cookies requeridas: 'authToken', 'connection_config' y 'user_usuario' (gestionadas por obtener_datos_cookies)
    """
    # Obtener token, datos de conexión y usuario desde cookies
    token, datos_conexion, usuario_cookie, error_mensaje = obtener_datos_cookies(request)
    
    # Si hay un error, retornarlo con 401
    if error_mensaje:
        return JsonResponse({
            "error": error_mensaje,
            "redirect": "https://cormons.app/login/?logout=1"
        }, status=401)

    # Usar el usuario de la cookie directamente (ya no usamos sesiones)
    usuario = usuario_cookie

    respuesta_chequesCartera = comando_chequesCartera(token, usuario, request)
    if not respuesta_chequesCartera:
        return JsonResponse({"error": "Error al obtener cheques en cartera"}, status=500)

    # Verificar si VFP respondió con error (token inválido, versión incorrecta, etc.)
    if respuesta_chequesCartera.get("estado") is False:
        # Retornar 401 incluyendo el mensaje devuelto por VFP para que el frontend
        # pueda mostrar el detalle exacto antes de redirigir.
        # NOTA: Ya no limpiamos sesión porque no la usamos - las cookies son manejadas por el frontend
        mensaje_vfp = respuesta_chequesCartera.get('mensaje', 'No hay mensaje de la interfaz')
        return JsonResponse({
            "error": mensaje_vfp,
            "redirect": "https://cormons.app/login/?logout=1"
        }, status=401)

    # Manejar ambas posibles claves de respuesta de VFP (cheques o chequesCartera)
    chequesCartera = respuesta_chequesCartera.get("cheques", [])
    mensaje = respuesta_chequesCartera.get("mensaje", "")

    print(f"📦 DEBUG: respuesta_chequesCartera keys = {list(respuesta_chequesCartera.keys())}")
    if mensaje:
        print(f"📢 DEBUG: VFP envió mensaje con estado true: {mensaje}")

    return JsonResponse({
        "chequesCartera": chequesCartera,
        "mensaje": mensaje
    }, status=200)

@require_http_methods(["GET"])
def permisosInformes_view(request):
    """Endpoint AJAX para obtener módulos habilitados"""
    token, _, _, error_mensaje = obtener_datos_cookies(request)
    
    if error_mensaje:
        return JsonResponse({"error": error_mensaje}, status=401)
    
    resultado = comando_permisosInformes(token, request)
    
    if not resultado["estado"]:
        return JsonResponse({"error": resultado["mensaje"]}, status=400)
    
    return JsonResponse({"informes": resultado["informes"]})

def logout_view(request):
    print("==== LOGOUT VIEW INFORMES ====")

    # Crear respuesta de redirección primero
    response = redirect('https://cormons.app/login/?logout=1')

    # Borrar cookies de sesión usando helper
    response = borrar_cookies_sesion(response)

    print("Redirigiendo a login con cookies borradas")

    return response