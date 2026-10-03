from sqlalchemy.orm import Session
from app.infrastructure.db.models import AlunoModel
from sqlalchemy import func

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

    def obter_estatisticas(self, curso_id: int=None, matricula: int=None, formado: bool=None, ira_max: float=None, semestre: int=None):
        
        busca = self.db.query(func.count(AlunoModel.matricula).label('total'), 
                              func.avg(AlunoModel.ira).label('ira_medio'))

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

        resultado = busca.first()

        return {
             "total": resultado.total or 0,
             "ira_medio": round(resultado.ira_medio or 0.0, 2)
        }
        
