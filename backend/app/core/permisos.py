from fastapi import HTTPException


def verificar_admin(usuario_actual: dict):
    if usuario_actual["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")


def verificar_propietario_evento(evento, usuario_actual: dict):
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return
