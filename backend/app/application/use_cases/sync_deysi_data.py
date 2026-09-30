import pandas as pd
from sqlalchemy.orm import Session
from app.infrastructure.db.models.disciplina_model import DisciplinaModel
from app.infrastructure.db.models.curso_model import CursoModel
from app.infrastructure.db.models.aluno_model import AlunoModel
from app.infrastructure.db.models.historico_disciplina_model import HistoricoDisciplinaModel

class SyncDeysiDataUseCase:
    def __init__(self, db: Session):
        self.db = db

    def executar(self):
        info_cursos = {
            "cc.csv": {"sigla": "CC", "nome": "Ciência da Computação"},
            "ea.csv": {"sigla": "EA", "nome": "Engenharia Ambiental e Sanitária"},
            "ec.csv": {"sigla": "EC", "nome": "Engenharia Civil"},
            "em.csv": {"sigla": "EM", "nome": "Engenharia de Minas"},
            "si.csv": {"sigla": "SI", "nome": "Sistemas de Informação"}
        }

        arquivos_cursos = ["cc.csv", "ea.csv", "ec.csv", "em.csv", "si.csv"]
        pasta_dados = "../data/"

        df_nomes = pd.read_csv("../data/codigos_disciplinas.csv", encoding='utf-8')
        mapa_nomes = dict(zip(df_nomes['Codigo_CRT'], df_nomes['Nome_Disciplina']))

        try:
            disciplinas_no_carrinho = set()
            for arquivo in arquivos_cursos:
                caminho_completo = pasta_dados + arquivo
                print(f"Sincronizando o arquivo: {arquivo}...")

                existe_curso = self.db.query(CursoModel).filter_by(sigla=info_cursos[arquivo]["sigla"]).first()
                if not existe_curso:
                    novo_curso = CursoModel(sigla=info_cursos[arquivo]["sigla"], nome=info_cursos[arquivo]["nome"])
                    self.db.add(novo_curso)

                dados = pd.read_csv(caminho_completo, encoding='utf-8')

                for coluna in dados.columns:
                    if coluna.startswith("CRT"):
                        existe_no_banco = self.db.query(DisciplinaModel).filter_by(codigo=coluna).first()
                    
                        if not existe_no_banco and coluna not in disciplinas_no_carrinho:
                            nome_disciplina = mapa_nomes.get(coluna, "A definir")
                            nova_disciplina = DisciplinaModel(codigo=coluna, nome=nome_disciplina)
                            self.db.add(nova_disciplina)
                            disciplinas_no_carrinho.add(coluna)
                self.db.flush()

                curso_atual = self.db.query(CursoModel).filter_by(sigla=info_cursos[arquivo]["sigla"]).first()

                for index, linha in dados.iterrows():
                    aluno_banco = self.db.query(AlunoModel).filter_by(matricula=linha["matricula"]).first()
                    
                    if not aluno_banco:
                        novo_aluno = AlunoModel(
                            matricula=linha["matricula"],
                            curso_id=curso_atual.id,  
                            cidade_nasceu=linha["cidade_em_que_nasceu"],
                            municipio_reside=linha["município_em_que_mora"],
                            ira=linha["ira"],
                            formado=(linha["formado"] == "SIM"),
                            semestre_atual=linha["semestre_em_que_o_aluno_está"],
                            ano_ingresso=str(linha["ano_de_ingresso"]),
                            prazo_conclusao=str(linha["prazo_para_terminar_o_curso"]),
                            ch_total=linha["ch_total"],
                            qtd_trancamentos=linha["quantidade_de_trancamentos"],
                            total_reprovacoes=linha["quantidade_de_reprovações"],
                            media_notas=linha["media_das_notas"],
                            variancia_notas=linha["variancia_das_notas"]
                        )
                        self.db.add(novo_aluno)

                    else:
                        aluno_banco.ira = linha["ira"]
                        aluno_banco.formado = (linha["formado"] == "SIM")
                        aluno_banco.semestre_atual = linha["semestre_em_que_o_aluno_está"]
                        aluno_banco.prazo_conclusao = str(linha["prazo_para_terminar_o_curso"])
                        aluno_banco.ch_total = linha["ch_total"]
                        aluno_banco.qtd_trancamentos = linha["quantidade_de_trancamentos"]
                        aluno_banco.total_reprovacoes = linha["quantidade_de_reprovações"]
                        aluno_banco.media_notas = linha["media_das_notas"]
                        aluno_banco.variancia_notas = linha["variancia_das_notas"]

                    for coluna in dados.columns:
                        if coluna.startswith("CRT"):
                            status_materia = linha[coluna]
                            coluna_reprovacao = f"reprovado_vezes_{coluna}"
                            qtd_reprovacoes = linha[coluna_reprovacao] if coluna_reprovacao in dados.columns else 0
                            if status_materia == 1 or qtd_reprovacoes > 0:
                                existe_historico = self.db.query(HistoricoDisciplinaModel).filter_by(
                                    aluno_matricula=linha["matricula"], 
                                    disciplina_codigo=coluna
                                ).first()
                                if not existe_historico:
                                    novo_historico = HistoricoDisciplinaModel(
                                        aluno_matricula=linha["matricula"],
                                        disciplina_codigo=coluna,
                                        status_conclusao=(status_materia == 1),
                                        qtd_reprovado=qtd_reprovacoes
                                    )
                                    self.db.add(novo_historico)
                                else:
                                    existe_historico.status_conclusao = (status_materia == 1)
                                    existe_historico.qtd_reprovado = qtd_reprovacoes
                
            self.db.commit()
            return {"mensagem": "Sincronização dos dados DEYSI concluída com sucesso!"}
                            
        except Exception as e:
            self.db.rollback()
            raise e