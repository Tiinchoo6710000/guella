from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base


class TicketFactorMapping(Base):
    __tablename__ = "ticket_factor_mapping"

    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String, nullable=False)
    subtipo = Column(String, nullable=False)
    factor_id = Column(Integer, ForeignKey("factores_emision.id"), nullable=True)

    factor = relationship("FactorEmision")

    __table_args__ = (
        UniqueConstraint('evento_id', 'tipo', 'subtipo', name='uix_evento_tipo_subtipo'),
    )
