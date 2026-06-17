from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_de_datos import Base


class Evidencia(Base):
    __tablename__ = "evidencias"

    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False, index=True)
    calculo_id = Column(Integer, ForeignKey("calculos.id", ondelete="CASCADE"), nullable=True, index=True)
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow)

    evento = relationship("Evento", back_populates="evidencias")
    calculo = relationship("Calculo", back_populates="evidencias")
