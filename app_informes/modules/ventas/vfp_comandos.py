"""
Servicios y lógica de negocio para la aplicación controlStock
Incluye llamadas a APIs externas y validaciones
"""
import logging
from datetime import datetime

from django.http import request
from ...core.tcp_client import enviar_consulta_tcp
from ... import APP_VERSION

logger = logging.getLogger(__name__)


def formatear_fecha(fecha_str):
    """
    Convierte una fecha en formato ISO (YYYY-MM-DD) o datetime a formato argentino (dd/mm/yyyy)

    Args:
        fecha_str: String en formato ISO, datetime object, o cualquier formato reconocible

    Returns:
        String en formato dd/mm/yyyy o el string original si no se puede parsear
    """
    if not fecha_str:
        return ""

    # Si ya es datetime, convertir directamente
    if isinstance(fecha_str, datetime):
        return fecha_str.strftime("%d/%m/%Y")

    # Intentar parsear diferentes formatos comunes
    formatos = [
        "%Y%m%d",             # 20251212 (formato compacto sin separadores - VFP)
        "%Y-%m-%d",           # 2024-12-01
        "%Y-%m-%dT%H:%M:%S",  # 2024-12-01T14:30:00
        "%Y/%m/%d",           # 2024/12/01
        "%d-%m-%Y",           # 01-12-2024
        "%d/%m/%Y",           # 01/12/2024 (ya está en formato correcto)
    ]

    fecha_str = str(fecha_str).strip()

    # Si ya está en formato dd/mm/yyyy, devolverlo tal cual
    if len(fecha_str) == 10 and fecha_str[2] == '/' and fecha_str[5] == '/':
        return fecha_str

    for formato in formatos:
        try:
            fecha_obj = datetime.strptime(fecha_str, formato)
            return fecha_obj.strftime("%d/%m/%Y")
        except ValueError:
            continue

    # Si no se pudo parsear, devolver el string original
    return fecha_str

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
        descripcion = item.get("descripcion", "").lower()  # ← Convertir a minúsculas
        if descripcion:
            informes_normalizados.append(descripcion)

    return {
        "estado": True,
        "mensaje": r.get("mensaje", ""),
        "informes": informes_normalizados  
    }

def comando_chequesCartera(token, usuario, request, parametros=None):
    mensaje = {
        "Comando": "chequesCartera",
        "Token": token,
        "Vista": "INFORMES",
        "usrActivo": usuario
    }
    
    r = enviar_consulta_tcp(mensaje, request=request)
    
    # Sin respuesta del servidor
    if not r:
        return {
            "estado": False,
            "mensaje": "Sin respuesta del servidor",
            "CHEQUES": [],  # ✅ Cambiar a mayúsculas
        }
    
    # ✅ Buscar CHEQUES con mayúsculas (como envía VFP)
    cheques = r.get("CHEQUES", [])
    
    # ✅ Devolver con mayúsculas (para mantener consistencia)
    return {
        "estado": r.get("estado", False),
        "mensaje": r.get("mensaje", ""),
        "CHEQUES": cheques,  # ✅ Cambiar a mayúsculas
    }