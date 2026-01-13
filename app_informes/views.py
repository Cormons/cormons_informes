from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from .utils import obtener_datos_cookies, renderizar_error, borrar_cookies_sesion
from .auth.vfp_comandos import comando_verificarToken


@ensure_csrf_cookie
def informes_view(request):
    print("==== INFORMES VIEW INICIANDO ====")
    
    # 1) Obtener cookies
    token, datos_conexion, usuario_cookie, error_mensaje = obtener_datos_cookies(request)
    empresa_nombre = datos_conexion.get('nombre', '') if datos_conexion else ''
    
    if error_mensaje:
        print(f"❌ ERROR EN COOKIES - {error_mensaje}")
        return renderizar_error(request, error_mensaje, empresa_nombre, redirect_to='https://cormons.app/')
    
    # 2) Verificar token con VFP
    respuesta_vfp = comando_verificarToken(token, request)
    print(f"📡 Respuesta VFP: {respuesta_vfp}")
    
    # 3) Sin respuesta del servidor
    if not respuesta_vfp:
        print("❌ SIN RESPUESTA DE VFP")
        return renderizar_error(request, "Sin respuesta del servidor", empresa_nombre, redirect_to='https://cormons.app/')
    
    # 4) VFP devolvió estado=False
    if respuesta_vfp.get("estado") is not True:
        mensaje = respuesta_vfp.get("mensaje", "Token inválido")
        print(f"❌ TOKEN INVÁLIDO - {mensaje}")
        request.session.flush()
        return renderizar_error(request, mensaje, empresa_nombre, redirect_to='https://cormons.app/')
    
    # 5) TODO OK - Extraer datos
    usuario = respuesta_vfp.get("usuario", "")
    nombre = respuesta_vfp.get("nombre", "")
    mensaje_vfp = respuesta_vfp.get("mensaje", "")
    
    print(f"✅ Usuario verificado: {usuario}")
    if mensaje_vfp:
        print(f"📢 VFP envió mensaje: {mensaje_vfp}")
    
    # 6) Renderizar template
    return render(request, "app_informes/informes.html", {
        "empresa_nombre": empresa_nombre,
        "usuario": usuario,
        "nombre": nombre,
        "error": False,
        "mensaje_inicial": mensaje_vfp,
    })


def logout_view(request):
    print("==== LOGOUT VIEW INFORMES ====")

    # Crear respuesta de redirección primero
    response = redirect('https://cormons.app/login/?logout=1')

    # Borrar cookies de sesión usando helper
    response = borrar_cookies_sesion(response)

    print("Redirigiendo a login con cookies borradas")

    return response