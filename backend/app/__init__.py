from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.presentation.routes import curso_routes
from app.presentation.routes import sync_routes
from app.presentation.routes import autenticacao_routes
from app.presentation.routes import aluno_routes
from app.presentation.routes import disciplina_routes
from app.presentation.routes import historico_routes

app = FastAPI(title="SARA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


app.include_router(curso_routes.router, prefix="/api")
app.include_router(sync_routes.router, prefix="/api")
app.include_router(autenticacao_routes, prefix="/api")
app.include_router(aluno_routes.router, prefix="/api")
app.include_router(disciplina_routes, prefix="/api")
app.include_router(historico_routes, prefix="/api")