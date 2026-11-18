from sqlalchemy.orm import Session
from app.infrastructure.db.models.usuario_model import UsuarioModel, PapelUsuario
from app.application.dtos.autenticacao_dto import RegistroUsuarioInput, LoginUsuarioInput, TokenOutput
from app.infrastructure.security.security_service import hash_password, verify_password, gerar_par_tokens

class RegistrarUsuarioUseCases:
    def __init__(self, db: Session):
        self.db = db

    def executar(self, dados: RegistroUsuarioInput) -> dict:
        email_limpo = dados.email.strip().lower()
        usuario_existente = self.db.query(UsuarioModel).filter_by(email=email_limpo).first()
        if usuario_existente:
            raise ValueError("E-mail já cadastrado no sistema.")

        papel_enum = (
            PapelUsuario.DAE
            if dados.papel == "dae"
            else PapelUsuario.COORDENACAO
        )

        novo_usuario = UsuarioModel(
            nome=dados.nome.strip(),
            email=email_limpo,
            senha_hash=hash_password(dados.senha),
            papel=papel_enum,
        )

        self.db.add(novo_usuario)
        self.db.commit()
        self.db.refresh(novo_usuario)

        return {
            "id": novo_usuario.id,
            "nome": novo_usuario.nome,
            "email": novo_usuario.email,
            "papel": novo_usuario.papel.value,
        }


class LoginUsuarioUseCase:
    def __init__(self, db: Session):
        self.db = db

    def executar(self, dados: LoginUsuarioInput) -> TokenOutput:
        usuario = self.db.query(UsuarioModel).filter_by(email=dados.email.strip()).first()

        if not usuario or not verify_password(dados.senha, usuario.senha_hash):
            raise ValueError("Credenciais inválidas.")

        access_token, refresh_token = gerar_par_tokens(usuario)

        return TokenOutput(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user={"nome": usuario.nome, "email": usuario.email, "papel": usuario.papel.value},
        )