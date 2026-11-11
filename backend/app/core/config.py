import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

class Settings:
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")

    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    ALLOW_ORIGINS = os.getenv("ALLOW_ORIGINS", "http://localhost:5173").split(",")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))

    ADMIN_NOME = os.getenv("ADMIN_NOME", "Administrador SARA")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
    ADMIN_SENHA = os.getenv("ADMIN_SENHA")

    USUARIO_NOME = os.getenv("USUARIO_NOME", "Consulta Acadêmica")
    USUARIO_EMAIL = os.getenv("USUARIO_EMAIL")
    USUARIO_SENHA = os.getenv("USUARIO_SENHA")

settings = Settings()