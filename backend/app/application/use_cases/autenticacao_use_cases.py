from sqlalchemy.orm import Session
from app.infrastructure.db.models.usuario_model import UsuarioModel
from app.application.dtos.autenticacao_dto import RegistroUsuarioInput, LoginUsuarioInput, TokenOutput
from app.infrastructure.security.security_service import hash_password, verify_password, create_access_token

class RegistrarUsuarioUseCase:
    def __init__(self, db: Session):
        self.db = db

    def executar(self, dados: RegistroUsuarioInput) -> dict: 
  
        usuario_existente = self.db.query(UsuarioModel).filter_by(email=dados.email).first()
        if usuario_existente:
            raise ValueError("Email já cadastrado no sistema.")

        novo_usuario = UsuarioModel(
            nome=dados.nome,
            email=dados.email,
            senha_hash=hash_password(dados.senha) 
        )
        
        self.db.add(novo_usuario)
        self.db.commit()
        self.db.refresh(novo_usuario)

        return {"id": novo_usuario.id, "email": novo_usuario.email}


class LoginUsuarioUseCase:
    def __init__(self, db: Session):
        self.db = db

    def executar(self, dados: LoginUsuarioInput) -> TokenOutput: # <-- Atualizado
        usuario = self.db.query(UsuarioModel).filter_by(email=dados.email).first()
        
        if not usuario or not verify_password(dados.senha, usuario.senha_hash):
            raise ValueError("Credenciais inválidas.")

        token = create_access_token({
            "sub": str(usuario.id), 
            "email": usuario.email, 
            "papel": usuario.papel.value
        })
        
        return TokenOutput(
            access_token=token,
            token_type="bearer",
            user={"nome": usuario.nome, "email": usuario.email}
        )