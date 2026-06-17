from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Float,
    UniqueConstraint
)

from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base

class TicketAsistente(Base):
    __tablename__ = "tickets_asistentes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    __table_args__ = (
    UniqueConstraint(
        "ticket_id",
        "evento_id",
        name="uq_ticket_evento"
    ),
)

    ticket_id = Column(
        String,
        nullable=False,
        
    )

    evento_id = Column(
        Integer,
        ForeignKey("eventos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    evento = relationship(
        "Evento",
        back_populates="tickets"
    )

    movilidades = relationship(
        "MovilidadTicket",
        back_populates="ticket",
        cascade="all, delete-orphan"
    )