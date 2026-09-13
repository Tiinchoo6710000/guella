from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    contrasena_hash = Column(String, nullable=False)
    rol = Column(String, default="productor")
    activo = Column(Boolean, default=True, nullable=False)
    debe_cambiar_password = Column(Boolean, default=False, nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Recuperación de contraseña
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    eventos = relationship("Evento", back_populates="usuario")