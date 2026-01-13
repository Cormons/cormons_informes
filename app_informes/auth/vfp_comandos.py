"""
Comandos VFP relacionados con autenticación y permisos
"""
from app_informes.core.tcp_client import enviar_consulta_tcp
from app_informes import APP_VERSION


def comando_verificarToken(token, request):
    """
    Envía comando verificarToken a VFP.
    Devuelve la respuesta literal de VFP (o None si falla la conexión).
    """
    mensaje = {
        "Comando": "verificarToken",
        "Token": token,
        "Vista": "INFORMES",
        "Version": APP_VERSION
    }
    return enviar_consulta_tcp(mensaje, request=request)


def comando_permisosInformes(token, request):
    mensaje = {
        "Comando": "permisosInformes",
        "Token": token,
        "Vista": "INFORMES",
        "Version": APP_VERSION
    }
    r = enviar_consulta_tcp(mensaje, request=request)
    
    # Sin respuesta del servidor
    if not r:
        return {
            "estado": False,
            "mensaje": "Sin respuesta del servidor"
        }

    estado_vfp = r.get("estado")

    # Si viene estado = false, devolver exactamente lo que vino
    if estado_vfp is not True and estado_vfp != "True":
        return {
            "estado": False,
            "mensaje": r.get("mensaje", "Token inválido")
        }

    informes_vfp = r.get("INFORMES", [])
    informes_normalizados = []

    for item in informes_vfp:
        descripcion = item.get("descripcion", "").lower()
        if descripcion:
            informes_normalizados.append(descripcion)

    return {
        "estado": True,
        "mensaje": r.get("mensaje", ""),
        "informes": informes_normalizados  
    }