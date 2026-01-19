"""
Comandos VFP específicos del módulo de Finanzas
"""
from app_informes.core.tcp_client import enviar_consulta_tcp
from app_informes import APP_VERSION


def comando_chequesCartera(token, usuario, request, parametros=None):
    """
    Consulta cheques en cartera al servidor VFP.
    
    Args:
        token: Token de autenticación del usuario
        usuario: Usuario activo
        request: Request de Django para obtener datos de conexión
        parametros: Parámetros adicionales (opcional, no usado actualmente)
        
    Returns:
        dict: {
            "estado": bool,
            "mensaje": str,
            "CHEQUES": list[dict]  # Lista de cheques con datos completos
        }
    """
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
            "CHEQUES": [],
        }
    
    # Buscar CHEQUES con mayúsculas (como envía VFP)
    cheques = r.get("CHEQUES", [])
    
    # Devolver con mayúsculas (para mantener consistencia)
    return {
        "estado": r.get("estado", False),
        "mensaje": r.get("mensaje", ""),
        "CHEQUES": cheques,
    }