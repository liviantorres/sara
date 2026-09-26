from sqlalchemy import Column, Integer, String
from app.infrastructure.db.session import Base

class UserModel(Base):
    __tablename__ = "usuario" 

    id = Column("id_usuario", Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password_hash = Column("senha_hash", String(255), nullable=False)