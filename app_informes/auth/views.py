from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from app_informes.utils import obtener_datos_cookies
from app_informes.core.vfp_comandos import comando_permisosInformes


@require_http_methods(["GET"])
def permisosInformes_view(request):
    """Endpoint AJAX para obtener módulos habilitados"""
    
    token, datos_conexion, _, error_mensaje = obtener_datos_cookies(request)
    
    if error_mensaje:
        return JsonResponse({"error": error_mensaje}, status=401)
    
    resultado = comando_permisosInformes(token, request)
    
    if not resultado["estado"]:
        return JsonResponse(
            {"error": resultado.get("mensaje", "No tienes permisos para acceder")},
            status=400
        )
    
    return JsonResponse({
        "informes": resultado["informes"],
        "mensaje": resultado.get("mensaje", "")
    })