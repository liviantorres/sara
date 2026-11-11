from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash
from app.core.config import settings 

pwd_context = PasswordHash.recommended()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

TOKENS_REVOGADOS: set[str] = set()

def revogar_token(token: str) -> None:
    if token:
        TOKENS_REVOGADOS.add(token)

def _criar_token(data: dict, tipo: str, validade: timedelta) -> str:
    to_encode = data.copy()
    to_encode.update({
        "type": tipo,
        "exp": datetime.now(timezone.utc) + validade,
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm= ALGORITHM)

def create_access_token(data: dict) -> str:
    return _criar_token(data, "access", timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

def create_refresh_token(data: dict) -> str:
    return _criar_token(data, "refresh", timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

def decode_token(token: str, tipo_esperado: str) -> dict:
    if token in TOKENS_REVOGADOS:
        raise jwt.InvalidTokenError("Token foi revogado.")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("type") != tipo_esperado:
        raise jwt.InvalidTokenError("Tipo de token incorreto.")
    return payload

def gerar_par_tokens(usuario) -> tuple[str, str]:
    claims = {
        "sub": str(usuario.id),
        "email": usuario.email,
        "papel": usuario.papel.value,
    }
    return create_access_token(claims), create_refresh_token(claims)
