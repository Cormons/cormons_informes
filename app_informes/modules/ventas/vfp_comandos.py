"""
Comandos VFP relacionados con el módulo de Ventas
"""
import logging
from datetime import datetime
from app_informes.core.tcp_client import enviar_consulta_tcp
from app_informes import APP_VERSION
from app_informes.core.vfp_comandos import formatear_fecha

logger = logging.getLogger(__name__)

def comando_clienteDescripcion(token, usuario, request, descripcion):
    """
    Busca clientes por descripción (razón social)
    
    Args:
        token: Token de autenticación
        usuario: Usuario activo
        request: Request de Django
        descripcion: Texto a buscar en razón social
    
    Returns:
        dict: Respuesta de VFP con lista de clientes o error
    """
    mensaje = {
        "Comando": "clienteDescripcion",  # ← Cambio aquí
        "Token": token,                    # ← Cambio aquí
        "Vista": "INFORMES",
        "UsrActivo": usuario,
        "descripcion": descripcion
    }
    
    r = enviar_consulta_tcp(mensaje, request=request)
    
    # Sin respuesta del servidor
    if not r:
        return {
            "estado": False,
            "mensaje": "Sin respuesta del servidor",
            "CLIENTES": []
        }
    
    # Devolver respuesta tal como viene de VFP
    return {
        "estado": r.get("estado", False),
        "mensaje": r.get("mensaje", ""),
        "CLIENTES": r.get("CLIENTES", []),
        "CLIENTE": r.get("CLIENTE")  # Por si viene un solo cliente
    }


def comando_clienteCodigo(token, usuario, request, codigo_cliente):
    """
    Busca cliente por código (devuelve información completa)
    
    Args:
        token: Token de autenticación
        usuario: Usuario activo
        request: Request de Django
        codigo_cliente: Código del cliente a buscar
    
    Returns:
        dict: Respuesta de VFP con información completa del cliente o error
    """
    mensaje = {
        "Comando": "clientecodigoctacte",
        "Token": token,
        "Vista": "INFORMES",
        "UsrActivo": usuario,
        "codigoCliente": int(codigo_cliente)
    }
    
    r = enviar_consulta_tcp(mensaje, request=request)
    
    # Sin respuesta del servidor
    if not r:
        return {
            "estado": False,
            "mensaje": "Sin respuesta del servidor",
            "CLIENTE": None
        }
    
    # Devolver respuesta tal como viene de VFP
    return {
        "estado": r.get("estado", False),
        "mensaje": r.get("mensaje", ""),
        "CLIENTE": r.get("CLIENTE")
    }