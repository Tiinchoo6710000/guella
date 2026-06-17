from pydantic import BaseModel, EmailStr


class UsuarioCrear(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str