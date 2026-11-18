import enum
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean
from app.infrastructure.db.session import Base

class PapelUsuario(str, enum.Enum):
    DAE = "dae" # usuario admin
    COORDENACAO = "coordenacao" #usuario comum

class UsuarioModel(Base):
    __tablename__ = "usuario" 

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    papel = Column(Enum(PapelUsuario, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=PapelUsuario.COORDENACAO)
    solicitou_recuperacao = Column(Boolean, nullable=False, default=False)
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())