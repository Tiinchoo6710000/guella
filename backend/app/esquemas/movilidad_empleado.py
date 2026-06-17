from pydantic import BaseModel
from typing import Optional


class MovilidadEmpleadoCrear(BaseModel):
    evento_id: int
    transporte: str
    distancia: float
    cantidad_empleados: int
    tipo_fuente: str
    comentario: Optional[str] = None