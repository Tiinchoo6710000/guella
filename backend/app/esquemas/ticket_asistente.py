from pydantic import BaseModel
from typing import List


class MovilidadCrear(BaseModel):
    transporte: str
    distancia: float


class TicketAsistenteCrear(BaseModel):
    ticket_id: str
    evento_id: int
    movilidades: List[MovilidadCrear]