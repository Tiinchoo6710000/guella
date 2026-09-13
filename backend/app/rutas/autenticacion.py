from datetime import datetime, timedelta
import secrets
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.base_de_datos import obtener_db
from app.modelos.usuario import Usuario
from app.esquemas.usuario import UsuarioLogin
from app.core.seguridad import verificar_password, crear_token, obtener_usuario_actual, generar_hash_password
from app.servicios.email_service import enviar_email_reset_password

router = APIRouter(prefix="/auth", tags=["Autenticación"])


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str


@router.post("/login")
def login(datos: UsuarioLogin, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario or not verificar_password(datos.password, usuario.contrasena_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = crear_token({
        "id": usuario.id,
        "rol": usuario.rol,
        "email": usuario.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "debe_cambiar_password": usuario.debe_cambiar_password,
        }
    }


@router.post("/cambiar-password")
def cambiar_password(
    datos: dict,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    """Permite al productor cambiar su contraseña de primer ingreso."""
    nueva_password = datos.get("nueva_password", "").strip()
    if len(nueva_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener al menos 8 caracteres"
        )

    usuario = db.query(Usuario).filter(Usuario.id == usuario_actual["id"]).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.contrasena_hash = generar_hash_password(nueva_password)
    usuario.debe_cambiar_password = False
    db.commit()

    return {"ok": True, "mensaje": "Contraseña actualizada correctamente"}


@router.post("/forgot-password")
async def forgot_password(datos: ForgotPasswordRequest, db: Session = Depends(obtener_db)):
    """Genera token de recuperación y envía email al usuario si existe."""
    email = datos.email.strip().lower()
    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="El correo electrónico ingresado no se encuentra registrado en Güella."
        )

    token = secrets.token_urlsafe(32)
    usuario.reset_token = token
    usuario.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={token}"

    try:
        await enviar_email_reset_password(email=usuario.email, nombre=usuario.nombre, reset_url=reset_url)
    except Exception as e:
        print(f"Error al enviar email de recuperación: {e}")

    return {
        "ok": True,
        "mensaje": "Se ha enviado un enlace de recuperación a tu correo electrónico."
    }


@router.post("/reset-password")
def reset_password(datos: ResetPasswordRequest, db: Session = Depends(obtener_db)):
    """Valida el token y define la nueva contraseña."""
    token = datos.token.strip()
    nueva_password = datos.nueva_password.strip()

    if len(nueva_password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    usuario = db.query(Usuario).filter(
        Usuario.reset_token == token,
        Usuario.reset_token_expiry > datetime.utcnow()
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=400,
            detail="El enlace de recuperación es inválido o ha expirado. Por favor solicitá uno nuevo."
        )

    usuario.contrasena_hash = generar_hash_password(nueva_password)
    usuario.reset_token = None
    usuario.reset_token_expiry = None
    usuario.debe_cambiar_password = False
    db.commit()

    return {"ok": True, "mensaje": "Contraseña actualizada exitosamente. Ya podés iniciar sesión con tu nueva contraseña."}