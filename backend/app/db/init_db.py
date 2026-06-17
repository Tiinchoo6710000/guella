
"""
DEPRECATED

Usar Alembic migrations.

No usar Base.metadata.create_all()
en producción.
"""

# Deprecated - usar Alembic migrations
#from app.db.base_de_datos import Base, motor

from app.db.base_de_datos import Base, motor

from app.modelos.usuario import Usuario
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.modelos.input_evento import InputEvento
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.movilidad_ticket import MovilidadTicket
from app.modelos.calculo import Calculo
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.evidencia import Evidencia


def inicializar_db():
    Base.metadata.create_all(bind=motor)