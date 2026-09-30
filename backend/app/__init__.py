from fastapi import FastAPI
from app.presentation.routes.auth_router import router as auth_router
from app.presentation.routes import curso_routes
from app.presentation.routes import sync_routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



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

app.include_router(auth_router)
