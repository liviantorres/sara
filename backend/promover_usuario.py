from app.infrastructure.db.session import SessionLocal
from app.infrastructure.db.models.usuario_model import UsuarioModel, PapelUsuario

db = SessionLocal()

meu_usuario = db.query(UsuarioModel).filter_by(email="livian@example.com").first()

if meu_usuario:
    meu_usuario.papel = PapelUsuario.DAE

    db.commit()
    print(f"Sucesso! O usuário {meu_usuario.nome} agora é da DAE.")
else:
    print("Usuário não encontrado.")