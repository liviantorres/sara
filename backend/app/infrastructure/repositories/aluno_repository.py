from sqlalchemy.orm import Session
from app.infrastructure.db.models import AlunoModel, CursoModel
from app.infrastructure.db.models.historico_disciplina_model import HistoricoDisciplinaModel
from app.infrastructure.db.models.disciplina_model import DisciplinaModel
from sqlalchemy import func, or_, case, desc, cast, String


class AlunoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self, pular: int=0, limite: int=100, curso_id: int=None, matricula: int= None,
                      formado: bool=None, ira_max: float=None, semestre: int=None):
        busca = self.db.query(AlunoModel)

        if curso_id is not None:
            busca = busca.filter(AlunoModel.curso_id == curso_id)

        if matricula is not None:
            busca = busca.filter(cast(AlunoModel.matricula, String).ilike(f"%{matricula}%"))

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
            busca = busca.filter(cast(AlunoModel.matricula, String).ilike(f"%{matricula}%"))
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

        tempo_ideal = case(
            (AlunoModel.curso_id.in_([2, 4, 5]), 10),
            else_=8 
        )
         
        q_todos = self.db.query(AlunoModel)

        q_cursando = self.db.query(AlunoModel).filter(
            AlunoModel.formado.is_(False)
        )

        q_retidos = self.db.query(AlunoModel).filter(
            AlunoModel.formado.is_(False),
            AlunoModel.semestre_atual > tempo_ideal
        )

        q_graf_todos = self.db.query(AlunoModel.ano_ingresso, func.count(AlunoModel.matricula).label('total_ingressantes'))
        q_graf_retidos = self.db.query(AlunoModel.ano_ingresso, func.count(AlunoModel.matricula).label('retidos')).filter(
            AlunoModel.formado == False, 
            AlunoModel.semestre_atual > tempo_ideal
        )
        
        q_graf_curso = self.db.query(CursoModel.nome, func.count(AlunoModel.matricula).label('retidos')).join(
            AlunoModel, CursoModel.id == AlunoModel.curso_id
        ).filter(
            AlunoModel.formado == False,
            AlunoModel.semestre_atual > tempo_ideal
        ).group_by(CursoModel.nome).order_by(desc('retidos')).all()

        dados_cursos = [{"curso": c.nome, "retidos": c.retidos} for c in q_graf_curso]

        dados_materias = []

        if curso_id is not None:
            q_todos = q_todos.filter(
                AlunoModel.curso_id == curso_id
            )

            q_cursando = q_cursando.filter(
                AlunoModel.curso_id == curso_id
            )

            q_retidos = q_retidos.filter(
                AlunoModel.curso_id == curso_id
            )

            q_graf_todos = q_graf_todos.filter(AlunoModel.curso_id == curso_id)
            q_graf_retidos = q_graf_retidos.filter(AlunoModel.curso_id == curso_id)

            q_materias = self.db.query(
                HistoricoDisciplinaModel.disciplina_codigo,
                DisciplinaModel.nome,
                func.sum(HistoricoDisciplinaModel.qtd_reprovado).label('reprovacoes')
            ).join(
                AlunoModel, HistoricoDisciplinaModel.aluno_matricula == AlunoModel.matricula
            ).join(
                DisciplinaModel, HistoricoDisciplinaModel.disciplina_codigo == DisciplinaModel.codigo
            ).filter(
                AlunoModel.curso_id == curso_id,
                HistoricoDisciplinaModel.qtd_reprovado > 0
            ).group_by(
                HistoricoDisciplinaModel.disciplina_codigo, 
                DisciplinaModel.nome
            ).order_by(desc('reprovacoes')).limit(5).all()

            for item in q_materias:
                if not item.nome or str(item.nome).strip().upper() == "A DEFINIR":
                    nome_exibicao = f"{item.disciplina_codigo} (Código)" 
                else:
                    nome_exibicao = item.nome 
                
                dados_materias.append({
                    "materia": nome_exibicao,
                    "reprovacoes": item.reprovacoes
                })

        total_alunos = q_todos.count()
        total_cursando = q_cursando.count()
        total_retidos = q_retidos.count()

        total_ano_bd = q_graf_todos.group_by(AlunoModel.ano_ingresso).all()
        grafico_bd = q_graf_retidos.group_by(AlunoModel.ano_ingresso).order_by(AlunoModel.ano_ingresso).all()

        q_graf_semestre = self.db.query(AlunoModel.semestre_atual, func.count(AlunoModel.matricula).label('retidos')).filter(
            AlunoModel.formado == False, 
            AlunoModel.semestre_atual > tempo_ideal
        )
        if curso_id is not None:
            q_graf_semestre = q_graf_semestre.filter(AlunoModel.curso_id == curso_id)

        grafico_semestre_bd = q_graf_semestre.group_by(AlunoModel.semestre_atual).order_by(AlunoModel.semestre_atual).all()

        dados_semestres = []
        for item in grafico_semestre_bd:
            if item.semestre_atual is not None:
                dados_semestres.append({
                    "semestre": f"{item.semestre_atual}º Sem",
                    "retidos": item.retidos
                })

        dict_retidos_ano = {item.ano_ingresso: item.retidos for item in grafico_bd}

        dados_graficos = []
        for item in sorted(total_ano_bd, key=lambda x: str(x.ano_ingresso or "")):
            if item.ano_ingresso is not None:
                dados_graficos.append({
                    "ano": str(item.ano_ingresso),
                    "retidos": dict_retidos_ano.get(item.ano_ingresso, 0),
                    "total": item.total_ingressantes
                })
        alunos_ativos = q_cursando.all()
        faixas_ira = {
            "IRA < 5.0": {"faixa": "IRA < 5.0", "regulares": 0, "retidos": 0},
            "5.0 a 6.9": {"faixa": "5.0 a 6.9", "regulares": 0, "retidos": 0},
            "7.0 a 7.9": {"faixa": "7.0 a 7.9", "regulares": 0, "retidos": 0},
            "IRA ≥ 8.0": {"faixa": "IRA ≥ 8.0", "regulares": 0, "retidos": 0},
        }

        for a in alunos_ativos:
            ira_val = a.ira or 0.0
            limite_sem = 10 if a.curso_id in [2, 4, 5] else 8
            retido = (a.semestre_atual or 0) > limite_sem

            if ira_val < 5.0:
                chave = "IRA < 5.0"
            elif ira_val < 7.0:
                chave = "5.0 a 6.9"
            elif ira_val < 8.0:
                chave = "7.0 a 7.9"
            else:
                chave = "IRA ≥ 8.0"

            if retido:
                faixas_ira[chave]["retidos"] += 1
            else:
                faixas_ira[chave]["regulares"] += 1

        dados_ira = list(faixas_ira.values())

        mapa_municipios = {}
        for a in alunos_ativos:
            mun = (a.municipio_reside or "").strip().upper()
            if not mun:
                continue
            limite_sem = 10 if a.curso_id in [2, 4, 5] else 8
            retido = (a.semestre_atual or 0) > limite_sem

            if mun not in mapa_municipios:
                mapa_municipios[mun] = {"municipio": mun.title(), "key": mun, "total": 0, "retidos": 0}

            mapa_municipios[mun]["total"] += 1
            if retido:
                mapa_municipios[mun]["retidos"] += 1

        dados_municipios = sorted(
            [
                {
                    **v,
                    "taxa": round((v["retidos"] / v["total"]) * 100, 1) if v["total"] > 0 else 0.0
                }
                for v in mapa_municipios.values()
            ],
            key=lambda x: x["total"],
            reverse=True
        )

        return {
            "total_alunos": total_alunos,
            "total_retidos": total_retidos,
            "total_cursando": total_cursando,
            "grafico": dados_graficos,
            "grafico_semestres": dados_semestres,
            "grafico_cursos": dados_cursos,
            "grafico_materias": dados_materias,
            "grafico_ira": dados_ira,
            "grafico_municipios": dados_municipios,
        }