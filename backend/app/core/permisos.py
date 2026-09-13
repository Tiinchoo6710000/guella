from fastapi import HTTPException


def verificar_admin(usuario_actual: dict):
    """Lanza 403 si el usuario no es admin."""
    if usuario_actual.get("rol") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado: se requiere rol de administrador"
        )


def verificar_propietario_evento(evento, usuario_actual: dict):
    """
    Verifica que el evento exista y que el usuario tenga acceso:
    - Admin: puede acceder a cualquier evento.
    - Productor: solo puede acceder a sus propios eventos.
    """
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    rol = usuario_actual.get("rol")
    if rol == "admin":
        return  # Admin ve todo

    usuario_id = usuario_actual.get("id")
    if evento.usuario_id != usuario_id:
        raise HTTPException(
            status_code=403,
            detail="No tenés permiso para acceder a este evento"
        )
