from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
import json
from .utils import obtener_datos_cookies, renderizar_error, borrar_cookies_sesion
from .vfp_comandos import comando_verificarToken, comando_chequesCartera, comando_permisosInformes

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

@require_http_methods(["GET"])
def chequesCartera_view(request):
    """Endpoint AJAX para obtener cheques en cartera"""
    
    # 🔧 SIMULACIÓN - Comentar cuando VFP esté listo
    # import random
    # from datetime import datetime, timedelta
    
    # cheques_simulados = []
    # bancos = ["Banco Nación", "Banco Galicia", "Banco Santander", "BBVA", "Macro"]
    # emisores = ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Pedro Rodríguez"]
    
    # for i in range(5):
    #     fecha_cobro = (datetime.now() + timedelta(days=random.randint(1, 60))).strftime("%d/%m/%Y")
    #     cheque = {
    #         "fechaCobro": fecha_cobro,
    #         "nroCheque": f"{random.randint(10000000, 99999999)}",
    #         "banco": random.choice(bancos),
    #         "emisor": random.choice(emisores),
    #         "importe": round(random.uniform(5000, 150000), 2),
    #         "eCheq": random.choice(["SI", "NO"]),
    #         "cruzado": random.choice(["SI", "NO"])
    #     }
    #     cheques_simulados.append(cheque)
    
    # return JsonResponse({ 
    #     "estado": True,
    #     "CHEQUES": cheques_simulados,
    #     "Mensaje": "Datos simulados para pruebas"
    # })
    
    # 🚫 CÓDIGO REAL
    # 1) Obtener cookies
    token, datos_conexion, usuario, error_mensaje = obtener_datos_cookies(request)
     
    if error_mensaje:
        return JsonResponse({"error": error_mensaje}, status=401)
    
    # 2) Consultar VFP
    respuesta_vfp = comando_chequesCartera(token, usuario, request)
    
    # 3) Sin respuesta
    if not respuesta_vfp:
        return JsonResponse({"error": "Sin respuesta del servidor"}, status=500)
    
    # 4) VFP devolvió estado=False
    estado_vfp = respuesta_vfp.get("estado")
    if estado_vfp is False or estado_vfp == "False":
        mensaje = respuesta_vfp.get("mensaje", "Error al consultar cheques")
        return JsonResponse({"error": mensaje}, status=400)
    
    # 5) ✅ NORMALIZAR RESPUESTA (REEMPLAZAR TODO DESDE AQUÍ)
    from datetime import datetime
    
    cheques_vfp = respuesta_vfp.get("CHEQUES", [])
    cheques_normalizados = []
    
    for cheque in cheques_vfp:
        # ✅ Normalizar formato de fecha: "20260113" → "13/01/2026"
        fecha_cobro_raw = cheque.get("fechacobro", "")
        if len(fecha_cobro_raw) == 8:  # YYYYMMDD
            try:
                fecha_obj = datetime.strptime(fecha_cobro_raw, "%Y%m%d")
                fecha_cobro = fecha_obj.strftime("%d/%m/%Y")
            except:
                fecha_cobro = fecha_cobro_raw
        else:
            fecha_cobro = fecha_cobro_raw
        
        # ✅ Normalizar boolean → string "SI"/"NO"
        echeq = "SI" if cheque.get("echeq") is True else "NO"
        cruzado = "SI" if cheque.get("cruzado") is True else "NO"
        
        # ✅ Crear cheque normalizado con camelCase
        cheque_normalizado = {
            "fechaCobro": fecha_cobro,
            "nroCheque": str(cheque.get("nrocheque", "")),
            "banco": cheque.get("banco", ""),
            "emisor": cheque.get("emisor", ""),
            "importe": float(cheque.get("importe", 0)),
            "eCheq": echeq,
            "cruzado": cruzado
        }
        
        cheques_normalizados.append(cheque_normalizado)
    
    mensaje = respuesta_vfp.get("mensaje", "")
    
    # 6) ✅ Devolver datos normalizados
    return JsonResponse({
        "CHEQUES": cheques_normalizados,
        "Mensaje": mensaje
    })

@require_http_methods(["GET"])
def permisosInformes_view(request):
    """Endpoint AJAX para obtener módulos habilitados"""
    
    # 🔧 SIMULACIÓN - Comentar cuando VFP esté listo
    # return JsonResponse({
    #      "informes": ["finanzas"],
    #      "mensaje": "Mensaje de prueba"
    #  })
    
    # 🚫 CÓDIGO REAL - Descomentar cuando VFP esté listo
    token, datos_conexion, _, error_mensaje = obtener_datos_cookies(request)
    
    # ✅ DEVOLVER JSON EN LUGAR DE HTML
    if error_mensaje:
        return JsonResponse({"error": error_mensaje}, status=401)
    
    resultado = comando_permisosInformes(token, request)
    
    # ✅ DEVOLVER JSON EN LUGAR DE HTML
    if not resultado["estado"]:
        return JsonResponse(
            {"error": resultado.get("mensaje", "No tienes permisos para acceder")},
            status=400
        )
    
    # ✅ TODO OK → Devolver JSON
    return JsonResponse({
        "informes": resultado["informes"],
        "mensaje": resultado.get("mensaje", "")
    })

def logout_view(request):
    print("==== LOGOUT VIEW INFORMES ====")

    # Crear respuesta de redirección primero
    response = redirect('https://cormons.app/login/?logout=1')

    # Borrar cookies de sesión usando helper
    response = borrar_cookies_sesion(response)

    print("Redirigiendo a login con cookies borradas")

    return response