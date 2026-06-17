from pydantic import BaseModel
from typing import Optional


class EvidenciaCrear(BaseModel):
    evento_id: int
    calculo_id: Optional[int] = None
    filename: str
    url: str
    tipo: str
