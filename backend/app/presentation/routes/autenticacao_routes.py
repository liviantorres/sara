from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.infrastructure.security.auth_deps import require_dae

import jwt
from app.infrastructure.db.session import get_db
from app.application.dtos.autenticacao_dto import (
    RegistroUsuarioInput,
    RedefinirSenhaInput,
    LoginUsuarioInput,
    TokenOutput,
    RefreshTokenInput,
    SolicitarRecuperacaoInput
)
from app.infrastructure.db.models.usuario_model import UsuarioModel
from app.infrastructure.security.security_service import (
    decode_token,
    gerar_par_tokens,
    revogar_token,
    hash_password,
)
from app.application.use_cases.autenticacao_use_cases import (
    RegistrarUsuarioUseCases,
    LoginUsuarioUseCase,
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.get("/usuarios", dependencies=[Depends(require_dae)])
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(UsuarioModel).order_by(UsuarioModel.id.asc()).all()
    return [
        {
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "papel": u.papel.value if hasattr(u.papel, "value") else str(u.papel),
            "solicitou_recuperacao": bool(u.solicitou_recuperacao),
            "data_criacao": u.data_criacao,
        }
        for u in usuarios
    ]


@router.post("/registrar", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_dae)])
def registrar(payload: RegistroUsuarioInput, db: Session = Depends(get_db)):
    use_case = RegistrarUsuarioUseCases(db)

    try:
        return use_case.executar(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/usuarios/{usuario_id}/senha", dependencies=[Depends(require_dae)])
def redefinir_senha_usuario(
    usuario_id: int,
    payload: RedefinirSenhaInput,
    db: Session = Depends(get_db),
):
    if not payload.nova_senha or len(payload.nova_senha.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 6 caracteres.",
        )

    usuario = db.query(UsuarioModel).filter_by(id=usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")

    usuario.senha_hash = hash_password(payload.nova_senha.strip())
    usuario.solicitou_recuperacao = False
    db.commit()
    return {"mensagem": f"Senha de {usuario.nome} redefinida com sucesso."}


@router.delete("/usuarios/{usuario_id}", dependencies=[Depends(require_dae)])
def remover_usuario(
    usuario_id: int,
    usuario_logado: UsuarioModel = Depends(require_dae),
    db: Session = Depends(get_db),
):
    if usuario_logado.id == usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode remover a sua própria conta em uso.",
        )

    usuario = db.query(UsuarioModel).filter_by(id=usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")

    db.delete(usuario)
    db.commit()
    return {"mensagem": "Usuário removido com sucesso."}


@router.post("/login", response_model=TokenOutput)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    payload = LoginUsuarioInput(email=form_data.username, senha=form_data.password)
    use_case = LoginUsuarioUseCase(db)

    try:
        return use_case.executar(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenOutput)
def refresh(payload: RefreshTokenInput, db: Session = Depends(get_db)):
    try:
        dados = decode_token(payload.refresh_token, "refresh")
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


@router.post("/recuperar-senha")
def solicitar_recuperacao_senha(payload: SolicitarRecuperacaoInput, db: Session = Depends(get_db)):
    if not payload.nova_senha or len(payload.nova_senha.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 6 caracteres.",
        )

    email_limpo = payload.email.strip().lower()
    usuario = db.query(UsuarioModel).filter_by(email=email_limpo).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não encontramos nenhuma conta cadastrada com este e-mail institucional.",
        )

    usuario.senha_hash = hash_password(payload.nova_senha.strip())
    usuario.solicitou_recuperacao = False
    db.commit()
    return {"mensagem": "Sua senha foi redefinida com sucesso! Você já pode fazer login."}