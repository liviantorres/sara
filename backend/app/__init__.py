from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.presentation.routes import curso_routes
from app.presentation.routes import sync_routes
from app.presentation.routes import autenticacao_routes

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
app.include_router(autenticacao_routes.router, prefix="/api")