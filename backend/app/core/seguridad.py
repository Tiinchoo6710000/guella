import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db.base_de_datos import obtener_db

# ─── Config ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "guella-dev-secret-key-change-in-prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "8"))

# ─── Crypto ───────────────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def generar_hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verificar_password(password: str, hash_guardado: str) -> bool:
    return pwd_context.verify(password, hash_guardado)


# ─── JWT ──────────────────────────────────────────────────────────────────────
def crear_token(datos: dict) -> str:
    payload = datos.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verificar_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# ─── Dependencia FastAPI ──────────────────────────────────────────────────────
def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(obtener_db)
) -> dict:
    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o token inválido",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verificar_token(token)
    if payload is None:
        raise credenciales_exception

    usuario_id: int = payload.get("id")
    if usuario_id is None:
        raise credenciales_exception

    # Importar aquí para evitar circular imports
    from app.modelos.usuario import Usuario
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise credenciales_exception

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol,
        "debe_cambiar_password": usuario.debe_cambiar_password,
    }


def asegurar_admin_fijo(db):
    """Compatibilidad: ya no se usa el admin fijo hardcodeado."""
    pass
