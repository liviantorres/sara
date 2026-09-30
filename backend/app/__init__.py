from fastapi import FastAPI
from app.presentation.routes.auth_router import router as auth_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="SARA Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


app.include_router(auth_router)
