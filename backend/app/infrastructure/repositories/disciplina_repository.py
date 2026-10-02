from sqlalchemy.orm import Session
from app.infrastructure.db.models import DisciplinaModel

class DisciplinaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self, pular: int=0, limite: int=100):
        disciplinas = self.db.query(DisciplinaModel).offset(pular).limit(limite).all()
        return disciplinas
