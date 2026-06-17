from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_de_datos import Base

class InputEvento(Base):
    __tablename__ = "inputs_evento"

    id = Column(Integer, primary_key=True, index=True)

    valor = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    tipo_fuente = Column(String, nullable=False)
    comentario = Column(String, nullable=True) # Nuevo campo para el comentario

    evento_id = Column(Integer, ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False, index=True)
    factor_id = Column(Integer,ForeignKey("factores_emision.id"),nullable=False,index=True)


    version = Column(Integer, default=1)
    es_actual = Column(Boolean, default=True)
    creado_en = Column(DateTime, default=datetime.utcnow)

    evento = relationship("Evento", back_populates="inputs")
    factor = relationship("FactorEmision",back_populates="inputs")