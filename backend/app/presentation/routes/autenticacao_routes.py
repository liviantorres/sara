from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm 
from sqlalchemy.orm import Session
from app.infrastructure.security.auth_deps import require_dae

import jwt
from app.infrastructure.db.session import get_db
from app.application.dtos.autenticacao_dto import RegistroUsuarioInput, LoginUsuarioInput, TokenOutput, RefreshTokenInput
from app.infrastructure.db.models.usuario_model import UsuarioModel
from app.infrastructure.security.security_service import decode_token, gerar_par_tokens, revogar_token
from app.application.use_cases.autenticacao_use_cases import RegistrarUsuarioUseCases, LoginUsuarioUseCase

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/registrar", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_dae)])
def registrar(payload: RegistroUsuarioInput, db: Session = Depends(get_db)):
    use_case = RegistrarUsuarioUseCases(db)
    
    try:
        return use_case.executar(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenOutput)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    payload = LoginUsuarioInput(email=form_data.username, senha=form_data.password)
    
    use_case = LoginUsuarioUseCase(db)
    
    try:
        return use_case.executar(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/refresh", response_model = TokenOutput)
def refresh(payload: RefreshTokenInput, db: Session = Depends(get_db)):
    try:
        dados= decode_token(payload.refresh_token, "refresh")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada. Faça login novamente.")

    usuario = db.query(UsuarioModel).filter_by(id=dados["sub"]).first()

    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado.")

    revogar_token(payload.refresh_token)
    access_token, refresh_token = gerar_par_tokens(usuario)

    return TokenOutput(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={"nome": usuario.nome, "email": usuario.email, "papel": usuario.papel.value},
    )

@router.post("/logout")
def logout(payload: RefreshTokenInput):
    revogar_token(payload.refresh_token)
    return {"mensagem": "Sessão encerrada com sucesso."}