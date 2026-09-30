from sqlalchemy.orm import Session
from app.infrastructure.db.models.curso_model import CursoModel

class CursoRepository:
    def __init__(self, db:Session):
        self.db = db

    def listar_todos(self):
        return self.db.query(CursoModel).all()