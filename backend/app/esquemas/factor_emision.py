from pydantic import BaseModel

class FactorCrear(BaseModel):
    categoria: str
    subtipo: str
    valor: float
    unidad: str
    region: str
    fuente: str
    version: str
    vigencia: str
    comentario: str