from pydantic import BaseModel
from typing import Optional

class InputEventoCrear(BaseModel):
    evento_id: int
    valor: float
    tipo_fuente: str
    # Campos opcionales para permitir la resolución automática
    factor_id: Optional[int] = None
    categoria: Optional[str] = None
    subtipo: Optional[str] = None
    comentario: Optional[str] = None