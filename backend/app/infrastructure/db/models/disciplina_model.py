from sqlalchemy import Column, String, Integer
from app.infrastructure.db.session import Base

class DisciplinaModel(Base):
    __tablename__ = "disciplina"

    codigo = Column(String(50), primary_key=True, index=True)
    nome = Column(String(200))