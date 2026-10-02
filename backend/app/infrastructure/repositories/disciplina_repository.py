from sqlalchemy.orm import Session
from app.infrastructure.db.models import DisciplinaModel

class DisciplinaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self):
        return self.db.query(DisciplinaModel).all()
