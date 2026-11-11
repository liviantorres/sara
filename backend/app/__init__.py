from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.infrastructure.security.auth_deps import get_current_user
from app.infrastructure.security.security_service import hash_password
from app.infrastructure.db.session import engine, Base, SessionLocal
from app.infrastructure.db import models
from app.infrastructure.db.models.usuario_model import UsuarioModel, PapelUsuario

from app.presentation.routes import curso_routes
from app.presentation.routes import sync_routes
from app.presentation.routes import autenticacao_routes
from app.presentation.routes import aluno_routes
from app.presentation.routes import disciplina_routes
from app.presentation.routes import historico_routes

app = FastAPI(title="SARA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _garantir_usuarios_iniciais():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        usuarios_padrao = [
            {
                "nome": settings.ADMIN_NOME,
                "email": settings.ADMIN_EMAIL,
                "senha": settings.ADMIN_SENHA,
                "papel": PapelUsuario.DAE,  # Perfil Administrador
            },
            {
                "nome": settings.USUARIO_NOME,
                "email": settings.USUARIO_EMAIL,
                "senha": settings.USUARIO_SENHA,
                "papel": PapelUsuario.COORDENACAO,  # Perfil Usuário Comum 
            },
        ]

        for u in usuarios_padrao:
            if not u["email"] or not u["senha"]:
                continue

            existente = db.query(UsuarioModel).filter_by(email=u["email"]).first()
            if not existente:
                novo = UsuarioModel(
                    nome=u["nome"],
                    email=u["email"],
                    senha_hash=hash_password(u["senha"]),
                    papel=u["papel"],
                )
                db.add(novo)
            else:
                existente.nome = u["nome"]
                existente.papel = u["papel"]
                existente.senha_hash = hash_password(u["senha"])

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"⚠️ Aviso ao inicializar usuários padrão: {e}")
    finally:
        db.close()


@app.on_event("startup")
def ao_iniciar():
    _garantir_usuarios_iniciais()


app.include_router(autenticacao_routes.router, prefix="/api")
app.include_router(sync_routes.router, prefix="/api")

protegido = [Depends(get_current_user)]
app.include_router(curso_routes.router, prefix="/api", dependencies=protegido)
app.include_router(aluno_routes.router, prefix="/api", dependencies=protegido)
app.include_router(disciplina_routes.router, prefix="/api", dependencies=protegido)
app.include_router(historico_routes.router, prefix="/api", dependencies=protegido)