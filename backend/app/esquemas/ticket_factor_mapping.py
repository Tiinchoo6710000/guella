from pydantic import BaseModel
from typing import List


class TicketFactorItem(BaseModel):
    subtipo: str
    factor_id: int | None = None


class TicketFactorMappingGuardar(BaseModel):
    mappings: List[TicketFactorItem]


class TicketFactorItemRespuesta(BaseModel):
    subtipo: str
    factor_id: int | None = None
    factor_valor: float | None = None
    factor_version: str | None = None
    factor_fuente: str | None = None
    factor_unidad: str | None = None
    label: str | None = None


class TicketFactorMappingRespuesta(BaseModel):
    mappings: List[TicketFactorItemRespuesta]
