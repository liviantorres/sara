import enum
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.infrastructure.db.session import Base

class PapelUsuario(str, enum.Enum):
    ADMIN = "admin"
    USUARIO = "usuario"

class UserModel(Base):
    __tablename__ = "usuario" 

    id = Column("id_usuario", Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    papel = Column(Enum(PapelUsuario), nullable=False, default=PapelUsuario.USUARIO)
    data_criacao= Column(DateTime(timezone=True), server_default=func.now())
    