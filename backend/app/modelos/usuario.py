from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    contrasena_hash = Column(String, nullable=False)
    rol = Column(String, default="productor")

    eventos = relationship("Evento", back_populates="usuario")