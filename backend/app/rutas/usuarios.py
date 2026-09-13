from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.permisos import verificar_admin
from app.core.seguridad import generar_hash_password, obtener_usuario_actual
from app.db.base_de_datos import obtener_db
from app.modelos.evento import Evento
from app.modelos.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def serializar_usuario(usuario, cantidad_eventos: int = 0):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol,
        "debe_cambiar_password": usuario.debe_cambiar_password,
        "creado_en": usuario.creado_en.isoformat() if usuario.creado_en else None,
        "cantidad_eventos": cantidad_eventos,
    }


@router.get("")
def listar_productores(
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    """Lista todos los usuarios productores. Solo accesible para admin."""
    verificar_admin(usuario_actual)

    productores = db.query(Usuario).filter(Usuario.rol == "productor").order_by(Usuario.creado_en.desc()).all()

    # Contar eventos por productor en una sola consulta
    conteos = dict(
        db.query(Evento.usuario_id, func.count(Evento.id))
        .filter(Evento.usuario_id.in_([p.id for p in productores]))
        .group_by(Evento.usuario_id)
        .all()
    )

    return [
        serializar_usuario(p, conteos.get(p.id, 0))
        for p in productores
    ]


@router.post("")
def crear_productor(
    datos: dict,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    """Crea un nuevo usuario productor. Solo accesible para admin."""
    verificar_admin(usuario_actual)

    nombre = datos.get("nombre", "").strip()
    email = datos.get("email", "").strip().lower()
    password = datos.get("password", "").strip()

    if not nombre or not email or not password:
        raise HTTPException(status_code=400, detail="Nombre, email y contraseña son obligatorios")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    existente = db.query(Usuario).filter(Usuario.email == email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email")

    nuevo = Usuario(
        nombre=nombre,
        email=email,
        contrasena_hash=generar_hash_password(password),
        rol="productor",
        debe_cambiar_password=True,   # Fuerza cambio en primer ingreso
        creado_en=datetime.utcnow(),
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return serializar_usuario(nuevo, 0)


@router.put("/{usuario_id}")
def editar_productor(
    usuario_id: int,
    datos: dict,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    """Actualiza el nombre y email de un usuario productor. Solo accesible para admin."""
    verificar_admin(usuario_actual)

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id, Usuario.rol == "productor").first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Productor no encontrado")

    nombre = datos.get("nombre", "").strip()
    email = datos.get("email", "").strip().lower()

    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if not email:
        raise HTTPException(status_code=400, detail="El email es obligatorio")

    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Formato de email inválido")

    existente = db.query(Usuario).filter(Usuario.email == email, Usuario.id != usuario_id).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe otro usuario con ese email")

    usuario.nombre = nombre
    usuario.email = email
    db.commit()
    db.refresh(usuario)

    cantidad_eventos = db.query(Evento).filter(Evento.usuario_id == usuario.id).count()

    return serializar_usuario(usuario, cantidad_eventos)


@router.delete("/{usuario_id}")
def eliminar_productor(
    usuario_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    """Elimina un usuario productor. Solo accesible para admin."""
    verificar_admin(usuario_actual)

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id, Usuario.rol == "productor").first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Productor no encontrado")

    db.delete(usuario)
    db.commit()
    return {"ok": True, "mensaje": "Productor eliminado correctamente"}

