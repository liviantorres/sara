from sqlalchemy import Column, Integer, String
from app.infrastructure.db.session import Base


class CursoModel(Base):
    __tablename__ = "curso"

    id = Column(Integer, primary_key=True, index=True)
    sigla = Column(String(20), nullable=False)
    nome = Column(String(100), nullable=False)