"""
Views del módulo de Ventas
Endpoints AJAX para consultas relacionadas con ventas
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from app_informes.utils import obtener_datos_cookies
from app_informes.core.vfp_comandos import formatear_fecha
from .vfp_comandos import comando_clienteDescripcion, comando_clienteCodigo


@require_http_methods(["GET"])
def buscarClienteDescripcion_view(request):
    """
    Endpoint AJAX para buscar clientes por descripción (razón social)
    
    Query params:
        descripcion: Texto a buscar en razón social
    """
    # 1) Obtener cookies
    token, datos_conexion, usuario, error_mensaje = obtener_datos_cookies(request)
    
    if error_mensaje:
        return JsonResponse({"error": error_mensaje}, status=401)
    
    # 2) Obtener parámetro de búsqueda
    descripcion = request.GET.get('descripcion', '').strip()
    
    if not descripcion:
        return JsonResponse({"error": "Debe ingresar una descripción para buscar"}, status=400)
    
    # 3) Consultar VFP
    respuesta_vfp = comando_clienteDescripcion(token, usuario, request, descripcion)
    
    # 4) Sin respuesta
    if not respuesta_vfp:
        return JsonResponse({"error": "Sin respuesta del servidor"}, status=500)
    
    # 5) VFP devolvió estado=False
    estado_vfp = respuesta_vfp.get("estado")
    if estado_vfp is False or estado_vfp == "False":
        mensaje = respuesta_vfp.get("mensaje", "Error al buscar clientes")
        return JsonResponse({"error": mensaje}, status=400)
    
    # 6) Procesar respuesta
    # Puede venir CLIENTE (singular) o CLIENTES (plural)
    cliente_singular = respuesta_vfp.get("CLIENTE")
    clientes_plural = respuesta_vfp.get("CLIENTES", [])
    
    # Si viene un solo cliente, normalizarlo como lista de 1 elemento
    if cliente_singular and not clientes_plural:
        clientes_plural = [cliente_singular]
    
    mensaje = respuesta_vfp.get("mensaje", "")
    
    # 7) Devolver datos (estado=true de VFP, aunque clientes esté vacío)
    return JsonResponse({
        "CLIENTES": clientes_plural,
        "Mensaje": mensaje
    })


@require_http_methods(["GET"])
def buscarClienteCodigo_view(request):
    """
    Endpoint AJAX para buscar cliente por código
    Devuelve información completa del cliente
    
    Query params:
        codigo: Código del cliente a buscar
    """
    # 1) Obtener cookies
    token, datos_conexion, usuario, error_mensaje = obtener_datos_cookies(request)
    
    if error_mensaje:
        return JsonResponse({"error": error_mensaje}, status=401)
    
    # 2) Obtener parámetro de búsqueda
    codigo = request.GET.get('codigo', '').strip()
    
    if not codigo:
        return JsonResponse({"error": "Debe ingresar un código para buscar"}, status=400)

    if not codigo.isdigit():
        return JsonResponse({"error": "El código debe ser numérico"}, status=400)

    # 3) Consultar VFP
    respuesta_vfp = comando_clienteCodigo(token, usuario, request, codigo)
    
    # 4) Sin respuesta del servidor
    if not respuesta_vfp:
        return JsonResponse({"error": "Sin respuesta del servidor"}, status=500)
    
    # 5) VFP devolvió estado=False
    estado_vfp = respuesta_vfp.get("estado")
    if estado_vfp is False or estado_vfp == "False":
        mensaje = respuesta_vfp.get("mensaje", "Error al consultar cliente")
        return JsonResponse({"error": mensaje}, status=400)
    
    # 6) Obtener cliente y mensaje
    cliente = respuesta_vfp.get("CLIENTE")
    mensaje = respuesta_vfp.get("mensaje", "")
    
    # 7) Normalizar fechas si existe el cliente
    if cliente:
        if cliente.get("fechaUltimaCompra"):
            cliente["fechaUltimaCompra"] = formatear_fecha(cliente["fechaUltimaCompra"])
        
        if cliente.get("fechaUltimoPago"):
            cliente["fechaUltimoPago"] = formatear_fecha(cliente["fechaUltimoPago"])
    
    # 8) Devolver datos (estado=true de VFP, aunque cliente sea None)
    return JsonResponse({
        "CLIENTE": cliente,
        "Mensaje": mensaje
    })