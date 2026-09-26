from fastapi import FastAPI
from app.infrastructure.db.session import Base, engine
import app.infrastructure.db.models.user_model 
from app.presentation.routes.auth_router import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SARA Backend")


app.include_router(auth_router)
