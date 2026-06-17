from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base
from sqlalchemy import Date


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(String, nullable=False)
    fecha = Column(Date, nullable=False)

    pais = Column(String, nullable=False)
    region = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)

    cantidad_asistentes = Column(
        Integer,
        nullable=False
    )

    estado = Column(
        String,
        default="estimado"
    )

    calculo_pendiente = Column(
        Boolean,
        default=False,
        nullable=False
    )

    public_slug = Column(
        String,
        nullable=True,
        unique=True,
        index=True
    )

    hash_datos = Column(
        String,
        nullable=True
    )

    hash_resultado = Column(
        String,
        nullable=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    usuario = relationship(
        "Usuario",
        back_populates="eventos"
    )

    inputs = relationship(
        "InputEvento",
        back_populates="evento",
        cascade="all, delete-orphan"
    )

    tickets = relationship(
        "TicketAsistente",
        back_populates="evento",
        cascade="all, delete-orphan"
    )

    movilidad_empleados = relationship(
        "MovilidadEmpleado",
        back_populates="evento",
        cascade="all, delete-orphan"
    )

    calculos = relationship(
        "Calculo",
        back_populates="evento",
        cascade="all, delete-orphan"
    )

    evidencias = relationship(
        "Evidencia",
        back_populates="evento",
        cascade="all, delete-orphan"
    )

    mappings = relationship(
        "TicketFactorMapping",
        backref="evento",
        cascade="all, delete-orphan"
    )