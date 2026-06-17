from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base_de_datos import obtener_db
from app.modelos.usuario import Usuario
from app.esquemas.usuario import UsuarioLogin
from app.core.seguridad import verificar_password, crear_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login")
def login(datos: UsuarioLogin, db: Session = Depends(obtener_db)):

    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()

    if not usuario or not verificar_password(datos.password, usuario.contrasena_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = crear_token({
        "id": usuario.id,
        "rol": usuario.rol,
        "email": usuario.email
    })

    return {"access_token": token}