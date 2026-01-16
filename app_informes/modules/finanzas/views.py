from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from app_informes.utils import obtener_datos_cookies
from app_informes.core.vfp_comandos import formatear_fecha
from .vfp_comandos import comando_chequesCartera

@require_http_methods(["GET"])
def chequesCartera_view(request):
    """Endpoint AJAX para obtener cheques en cartera"""
    
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
    
    # 5) Normalizar respuesta
    cheques_vfp = respuesta_vfp.get("CHEQUES", [])
    cheques_normalizados = []
    
    for cheque in cheques_vfp:
        # Normalizar formato de fecha usando función centralizada
        fecha_cobro = formatear_fecha(cheque.get("fechacobro", ""))
        
        # Normalizar boolean → string "SI"/"NO"
        echeq = "SI" if cheque.get("echeq") is True else "NO"
        cruzado = "SI" if cheque.get("cruzado") is True else "NO"
        
        # Crear cheque normalizado con camelCase
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
    
    # 6) Devolver datos normalizados
    return JsonResponse({
        "CHEQUES": cheques_normalizados,
        "Mensaje": mensaje
    })