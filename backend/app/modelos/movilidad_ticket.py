from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship
from app.db.base_de_datos import Base


class MovilidadTicket(Base):

    __tablename__ = "movilidad_ticket"

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

    ticket_id = Column(
        Integer,
        ForeignKey(
            "tickets_asistentes.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    ticket = relationship(
        "TicketAsistente",
        back_populates="movilidades"
    )