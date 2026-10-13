from sqlalchemy.orm import Session
from app.infrastructure.db.models.historico_disciplina_model import HistoricoDisciplinaModel
from app.infrastructure.db.models.disciplina_model import DisciplinaModel

class HistoricoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self, pular: int = 0, limite: int = 300, aluno_matricula: int = None):
        busca = self.db.query(
            HistoricoDisciplinaModel.aluno_matricula,
            HistoricoDisciplinaModel.disciplina_codigo,
            HistoricoDisciplinaModel.status_conclusao,
            HistoricoDisciplinaModel.qtd_reprovado,
            DisciplinaModel.nome.label("disciplina_nome")
        ).outerjoin(
            DisciplinaModel, HistoricoDisciplinaModel.disciplina_codigo == DisciplinaModel.codigo
        )
        if aluno_matricula is not None:
            busca = busca.filter(HistoricoDisciplinaModel.aluno_matricula == aluno_matricula)
        return busca.offset(pular).limit(limite).all()
