from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.infrastructure.db.models.disciplina_model import DisciplinaModel
from app.infrastructure.db.models.aluno_model import AlunoModel
from app.infrastructure.db.models.historico_disciplina_model import HistoricoDisciplinaModel

class DisciplinaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self, pular: int=0, limite: int=100):
        disciplinas = self.db.query(DisciplinaModel).offset(pular).limit(limite).all()
        return disciplinas

    def obter_ranking(self, curso_id: int = None, limite: int = 50):
        busca = self.db.query(
            HistoricoDisciplinaModel.disciplina_codigo,
            DisciplinaModel.nome,
            func.sum(HistoricoDisciplinaModel.qtd_reprovado).label('reprovacoes')
        ).join(
            DisciplinaModel, HistoricoDisciplinaModel.disciplina_codigo == DisciplinaModel.codigo
        )

        if curso_id is not None:
            busca = busca.join(
                AlunoModel, HistoricoDisciplinaModel.aluno_matricula == AlunoModel.matricula
            ).filter(AlunoModel.curso_id == curso_id)

        busca = busca.filter(HistoricoDisciplinaModel.qtd_reprovado > 0)
        
        resultado = busca.group_by(
            HistoricoDisciplinaModel.disciplina_codigo,
            DisciplinaModel.nome
        ).order_by(desc('reprovacoes')).limit(limite).all()

        retorno = []
        for item in resultado:
            nome_exib = item.nome if item.nome and str(item.nome).strip().upper() != "A DEFINIR" else f"{item.disciplina_codigo} (Código)"
            retorno.append({
                "codigo": item.disciplina_codigo,
                "nome": nome_exib,
                "reprovacoes": item.reprovacoes
            })
        return retorno