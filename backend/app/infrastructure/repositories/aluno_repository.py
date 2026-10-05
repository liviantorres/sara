from sqlalchemy.orm import Session
from app.infrastructure.db.models import AlunoModel
from sqlalchemy import func, or_

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

    def obter_dados_dashboard(self, curso_id: int = None):
        q_todos = self.db.query(AlunoModel)
        q_retidos = self.db.query(AlunoModel).filter(
            AlunoModel.formado == False, 
            or_(AlunoModel.total_reprovacoes >= 3, AlunoModel.ira < 5.0)
        )

        q_graf_todos = self.db.query(AlunoModel.ano_ingresso, func.count(AlunoModel.matricula).label('total_ingressantes'))
        q_graf_retidos = self.db.query(AlunoModel.ano_ingresso, func.count(AlunoModel.matricula).label('retidos')).filter(
            AlunoModel.formado == False, 
            or_(AlunoModel.total_reprovacoes >= 3, AlunoModel.ira < 5.0)
        )

        if curso_id is not None:
            q_todos = q_todos.filter(AlunoModel.curso_id == curso_id)
            q_retidos = q_retidos.filter(AlunoModel.curso_id == curso_id)
            q_graf_todos = q_graf_todos.filter(AlunoModel.curso_id == curso_id)
            q_graf_retidos = q_graf_retidos.filter(AlunoModel.curso_id == curso_id)

        total_alunos = q_todos.count()
        total_retidos = q_retidos.count()

        total_ano_bd = q_graf_todos.group_by(AlunoModel.ano_ingresso).all()
        grafico_bd = q_graf_retidos.group_by(AlunoModel.ano_ingresso).order_by(AlunoModel.ano_ingresso).all()
        
        dict_total_ano = {item.ano_ingresso: item.total_ingressantes for item in total_ano_bd}

        dados_graficos = []
        for item in grafico_bd:
            if item.ano_ingresso is not None:
                dados_graficos.append({
                    "ano": str(item.ano_ingresso),
                    "retidos": item.retidos,
                    "total": dict_total_ano.get(item.ano_ingresso, 0)
                })

        return {
            "total_alunos": total_alunos,
            "total_retidos": total_retidos,
            "grafico": dados_graficos
        }