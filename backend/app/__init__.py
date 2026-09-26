from fastapi import FastAPI
from app.infrastructure.db.session import Base, engine
import app.infrastructure.db.models.user_model 
from app.presentation.routes.auth_router import router as auth_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SARA Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


app.include_router(auth_router)
