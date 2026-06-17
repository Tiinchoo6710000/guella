from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base

class DetalleCalculo(Base):
    __tablename__ = "detalle_calculo"

    id = Column(Integer, primary_key=True, index=True)

    categoria = Column(String, nullable=False)
    subtipo = Column(String, nullable=True)
    emisiones = Column(Float, nullable=False)

    # INPUT TRACE
    input_id = Column(Integer, nullable=True)
    input_version = Column(Integer, nullable=True)

    input_valor = Column(Float)
    input_unidad = Column(String)

    # FACTOR TRACE
    factor_id = Column(Integer, nullable=True)
    factor_valor = Column(Float)
    factor_unidad = Column(String)
    factor_version = Column(String)
    factor_fuente = Column(String)
    cantidad_empleados = Column(Integer)
    tipo_fuente = Column(String)

    comentario = Column(String, nullable=True) # Nuevo campo para el comentario
    # ORIGEN
    origen = Column(String)  # "input" o "ticket"

    calculo_id = Column(Integer, ForeignKey("calculos.id", ondelete="CASCADE"), nullable=False)

    calculo = relationship("Calculo", back_populates="detalles")