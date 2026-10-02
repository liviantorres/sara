from sqlalchemy.orm import Session
from app.infrastructure.db.models.historico_disciplina_model import HistoricoDisciplinaModel

class HistoricoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self, pular: int=0, limite: int=100, aluno_matricula: int=None):
        busca = self.db.query(HistoricoDisciplinaModel)

        if aluno_matricula is not None:
            busca = busca.filter(HistoricoDisciplinaModel.aluno_matricula == aluno_matricula)

        return busca.offset(pular).limit(limite).all()
