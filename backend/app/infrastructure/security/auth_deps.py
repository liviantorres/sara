from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session

from app.infrastructure.security.security_service import SECRET_KEY, ALGORITHM
from app.infrastructure.db.session import get_db
from app.infrastructure.db.models.usuario_model import UsuarioModel, PapelUsuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str=Depends(oauth2_scheme), db: Session=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = db.query(UsuarioModel).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    return user

def require_dae(current_user: UsuarioModel = Depends(get_current_user)):
    if current_user.papel != PapelUsuario.DAE:
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas a DAE pode atualizar o sistema.")

    return current_user