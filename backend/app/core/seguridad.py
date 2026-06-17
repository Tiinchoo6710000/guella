def generar_hash_password(password: str):
    raise NotImplementedError("No hay manejo de contraseñas en esta configuración")


def verificar_password(password: str, hash_guardado: str):
    raise NotImplementedError("No hay manejo de contraseñas en esta configuración")


def crear_token(datos: dict):
    raise NotImplementedError("Los tokens no están habilitados en esta instalación")


def verificar_token(token: str):
    raise NotImplementedError("Los tokens no están habilitados en esta instalación")


def obtener_usuario_actual():
    return {"id": 1, "nombre": "admin", "rol": "admin"}


def asegurar_admin_fijo(db):
    from app.modelos.usuario import Usuario

    admin = db.query(Usuario).filter(Usuario.id == 1).first()
    if admin:
        return admin

    admin = Usuario(
        id=1,
        nombre="admin",
        email="admin@guella.local",
        contrasena_hash="admin-fijo-sin-login",
        rol="admin"
    )
    db.add(admin)
    db.flush()
    return admin
