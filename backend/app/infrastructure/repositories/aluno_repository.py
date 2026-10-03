from sqlalchemy.orm import Session
from app.infrastructure.db.models import AlunoModel

class AlunoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self, pular: int=0, limite: int=100, curso_id: int=None, matricula: int= None,
                      formado: bool=None, ira_max: float=None, semestre: int=None):
        busca = self.db.query(AlunoModel)

        if curso_id is not None:
            busca = busca.filter(AlunoModel.curso_id == curso_id)

        if matricula is not None:
            busca = busca.filter(AlunoModel.matricula == matricula)

        if formado is not None:
            busca = busca.filter(AlunoModel.formado == formado)

        if ira_max is not None:
            busca = busca.filter(AlunoModel.ira <=ira_max)

        if semestre is not None:
            busca = busca.filter(AlunoModel.semestre_atual == semestre)

        return busca.offset(pular).limit(limite).all()