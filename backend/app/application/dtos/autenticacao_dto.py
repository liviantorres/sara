from pydantic import BaseModel
from typing import Optional

class RegistroUsuarioInput(BaseModel):
    nome: str
    email: str
    senha: str
    papel: Optional[str] = "coordenacao"

class RedefinirSenhaInput(BaseModel):
    nova_senha: str

class LoginUsuarioInput(BaseModel):
    email: str
    senha: str

class TokenOutput(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

class RefreshTokenInput(BaseModel):
    refresh_token: str

class SolicitarRecuperacaoInput(BaseModel):
    email: str
    nova_senha: str