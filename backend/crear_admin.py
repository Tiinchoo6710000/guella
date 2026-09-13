"""
Script para crear/actualizar el usuario admin inicial de Güella.
Uso: python crear_admin.py
"""
# Importar todos los modelos para que SQLAlchemy resuelva las relaciones
import app.modelos  # noqa: F401
from app.db.base_de_datos import SesionLocal
from app.modelos.usuario import Usuario
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

EMAIL_ADMIN = "admin@guella.com"
PASSWORD_ADMIN = "Admin2024!"

def crear_o_actualizar_admin():
    db = SesionLocal()
    try:
        # Buscar por email primero
        admin = db.query(Usuario).filter(Usuario.email == EMAIL_ADMIN).first()
        if not admin:
            # Buscar el usuario id=1 (el fijo hardcodeado del sistema anterior) y actualizarlo
            admin = db.query(Usuario).filter(Usuario.id == 1).first()

        if admin:
            print(f"Usuario encontrado: {admin.email} (id={admin.id}) — actualizando...")
            admin.nombre = "Admin Güella"
            admin.email = EMAIL_ADMIN
            admin.contrasena_hash = pwd_context.hash(PASSWORD_ADMIN)
            admin.rol = "admin"
            admin.debe_cambiar_password = False
            db.commit()
            db.refresh(admin)
            print(f"Admin actualizado: {admin.email} (id={admin.id})")
        else:
            admin = Usuario(
                nombre="Admin Güella",
                email=EMAIL_ADMIN,
                contrasena_hash=pwd_context.hash(PASSWORD_ADMIN),
                rol="admin",
                debe_cambiar_password=False
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"Admin creado: {admin.email} (id={admin.id})")

        print(f"\n✅ Credenciales de acceso:")
        print(f"   Email:    {EMAIL_ADMIN}")
        print(f"   Password: {PASSWORD_ADMIN}")
    finally:
        db.close()

if __name__ == "__main__":
    crear_o_actualizar_admin()
