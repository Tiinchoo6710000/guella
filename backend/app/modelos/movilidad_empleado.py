from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base


class MovilidadEmpleado(Base):

    __tablename__ = "movilidad_empleado"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transporte = Column(
        String,
        nullable=False
    )

    distancia = Column(
        Float,
        nullable=False
    )

    cantidad_empleados = Column(
        Integer,
        nullable=False
    )

    evento_id = Column(
        Integer,
        ForeignKey("eventos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    tipo_fuente = Column(String, nullable=False)
    comentario = Column(String, nullable=True) # Nuevo campo para el comentario

    evento = relationship(
        "Evento",
        back_populates="movilidad_empleados"
    )
