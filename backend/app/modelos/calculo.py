from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base

class Calculo(Base):
    __tablename__ = "calculos"

    id = Column(Integer, primary_key=True, index=True)
    total = Column(Float, nullable=False)
    estado = Column(String, default="estimado")
    evento_id = Column(Integer, ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, default=1)
    es_actual = Column(Boolean, default=True)

    detalles = relationship("DetalleCalculo", back_populates="calculo",cascade="all, delete-orphan")
    evidencias = relationship("Evidencia", back_populates="calculo", cascade="all, delete-orphan")
    evento = relationship("Evento",back_populates="calculos")