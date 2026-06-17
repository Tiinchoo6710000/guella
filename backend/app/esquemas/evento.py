from datetime import date
from pydantic import BaseModel


class EventoCrear(BaseModel):
    nombre: str
    fecha: date

    pais: str
    region: str
    ciudad: str

    cantidad_asistentes: int