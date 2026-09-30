from pydantic import BaseModel

class RegistroUsuarioInput(BaseModel):
    nome: str
    email: str
    senha: str 

class LoginUsuarioInput(BaseModel):
    email: str
    senha: str

class TokenOutput(BaseModel):
    access_token: str
    token_type: str
    user: dict