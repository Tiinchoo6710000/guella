from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base


class FactorEmision(Base):
    __tablename__ = "factores_emision"

    id = Column(Integer, primary_key=True, index=True)

    categoria = Column(String, nullable=False)
    subtipo = Column(String, nullable=False)

    valor = Column(Float, nullable=False)

    unidad = Column(String, nullable=False)

    region = Column(String, nullable=False)

    fuente = Column(String, nullable=False)

    version = Column(String, nullable=False)

    vigencia = Column(String, nullable=False)

    comentario =Column(String, nullable=False)

    inputs = relationship(
        "InputEvento",
        back_populates="factor"
    )