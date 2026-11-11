from sqlalchemy.orm import Session
from fastapi import UploadFile
from typing import List, Optional
import urllib.request
import urllib.error
import pandas as pd
import json
import time
import os
import io

from app.infrastructure.db.models.disciplina_model import DisciplinaModel
from app.infrastructure.db.models.curso_model import CursoModel
from app.infrastructure.db.models.aluno_model import AlunoModel
from app.infrastructure.db.models.historico_disciplina_model import HistoricoDisciplinaModel


STATUS_SYNC_AUTO = {
    "em_andamento": False,
    "cancelado": False,
    "etapa": "idle",
    "lote_atual": 0,
    "total_lotes": 0,
    "progresso": 0,
    "curso_atual": "",
    "intervalo_atual": "",
    "segundos_pausa_restantes": 0,
    "mensagem": "",
    "avisos": [], 
}


class SyncDeysiDataUseCases:
    TAMANHO_LOTE_ANOS = 3
    TEMPO_PAUSA_SEGUNDOS = 120  # 2 minutos

    INFO_CURSOS = {
        "cc.csv": {"sigla": "CC", "nome": "Ciência da Computação", "nome_sigaa": "Ciência da Computação", "carga_horaria": 3280},
        "ea.csv": {"sigla": "EA", "nome": "Engenharia Ambiental e Sanitária", "nome_sigaa": "Engenharia Ambiental", "carga_horaria": 4032},
        "ec.csv": {"sigla": "EC", "nome": "Engenharia Civil", "nome_sigaa": "Engenharia Civil", "carga_horaria": 3909},
        "em.csv": {"sigla": "EM", "nome": "Engenharia de Minas", "nome_sigaa": "Engenharia de Minas", "carga_horaria": 4045},
        "si.csv": {"sigla": "SI", "nome": "Sistemas de Informação", "nome_sigaa": "Sistemas de Informação", "carga_horaria": 3236},
    }

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.daisy_api_url = self._detectar_url_daisy()

    def _detectar_url_daisy(self) -> str:
        urls_candidatas = [
            os.getenv("DAISY_API_URL", ""),
            "http://172.18.0.1:5000",
            "http://172.18.0.2:5000",
            "http://172.17.0.1:5000",
            "http://daisy_app:5000",
            "http://host.docker.internal:5000",
            "http://localhost:5000",
            "http://127.0.0.1:5000",
        ]
        for url in [u for u in urls_candidatas if u]:
            try:
                req = urllib.request.Request(f"{url}/", method="GET")
                with urllib.request.urlopen(req, timeout=2) as resp:
                    if resp.status == 200:
                        return url
            except Exception:
                continue
        return "http://172.18.0.1:5000"

    def verificar_conexao_daisy(self) -> bool:
        try:
            req = urllib.request.Request(f"{self.daisy_api_url}/", method="GET")
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def _contar_alunos_no_csv_daisy(self, nome_arquivo: str) -> int:
        if not nome_arquivo:
            return 0
        try:
            req = urllib.request.Request(f"{self.daisy_api_url}/api/baixar_csv/{nome_arquivo}", method="GET")
            with urllib.request.urlopen(req, timeout=5) as resp:
                linhas = resp.read().decode("utf-8", errors="ignore").strip().splitlines()
                return max(0, len(linhas) - 1)  # Desconta o cabeçalho
        except Exception:
            return 0

    def obter_status_atual(self) -> dict:
        try:
            req = urllib.request.Request(f"{self.daisy_api_url}/api/status_extracao", method="GET")
            with urllib.request.urlopen(req, timeout=3) as resp:
                status_daisy = json.loads(resp.read().decode("utf-8"))
                if status_daisy.get("em_andamento") and not STATUS_SYNC_AUTO.get("cancelado"):
                    arquivo = status_daisy.get("arquivo_gerado") or "cc.csv"
                    qtd_alunos = self._contar_alunos_no_csv_daisy(arquivo)
                    curso = status_daisy.get("curso") or STATUS_SYNC_AUTO.get("curso_atual") or "Curso"
                    ano_i = status_daisy.get("ano_inicial") or ""
                    ano_f = status_daisy.get("ano_final") or ""

                    STATUS_SYNC_AUTO["em_andamento"] = True
                    if STATUS_SYNC_AUTO["etapa"] not in ("pausa", "sincronizando"):
                        STATUS_SYNC_AUTO["etapa"] = "extraindo"
                        STATUS_SYNC_AUTO["curso_atual"] = curso
                        STATUS_SYNC_AUTO["intervalo_atual"] = f"{ano_i}–{ano_f}"

                        if STATUS_SYNC_AUTO["total_lotes"] == 0:
                            STATUS_SYNC_AUTO["lote_atual"] = 1
                            STATUS_SYNC_AUTO["total_lotes"] = 15

                        # Calcula o progresso dinâmico dentro da fatia do lote atual
                        total_lotes = max(1, STATUS_SYNC_AUTO["total_lotes"])
                        lote_atual = max(1, STATUS_SYNC_AUTO["lote_atual"])
                        fatia_lote = 100.0 / total_lotes
                        progresso_inicio_lote = (lote_atual - 1) * fatia_lote

                        # Estimativa suave: avança até 80% da fatia do lote conforme qtd_alunos cresce
                        # Usa curva assintótica (qtd / (qtd + 60)) para nunca travar nem passar de 80% da fatia
                        fracao_extracao = (qtd_alunos / (qtd_alunos + 60.0)) * 0.80 if qtd_alunos > 0 else 0.05
                        novo_progresso = int(progresso_inicio_lote + (fatia_lote * fracao_extracao))
                        STATUS_SYNC_AUTO["progresso"] = max(STATUS_SYNC_AUTO["progresso"], min(99, novo_progresso))

                        STATUS_SYNC_AUTO["mensagem"] = (
                            f"Extraindo {curso} ({ano_i}–{ano_f}) no SIGAA... "
                            f"({qtd_alunos} alunos já salvos em {arquivo})"
                        )
        except Exception:
            pass

        return STATUS_SYNC_AUTO
    
    def cancelar_sincronizacao(self):
        STATUS_SYNC_AUTO.update({
            "cancelado": True,
            "em_andamento": False,
            "etapa": "cancelado",
            "segundos_pausa_restantes": 0,
            "mensagem": "Extração cancelada pelo usuário. Os lotes já finalizados foram mantidos no banco.",
        })
        try:
            req = urllib.request.Request(f"{self.daisy_api_url}/api/cancelar_extracao", method="POST")
            urllib.request.urlopen(req, timeout=5).close()
        except Exception:
            pass
        return STATUS_SYNC_AUTO

    def _carregar_mapa_nomes(self, arquivo_codigos: Optional[UploadFile] = None) -> dict:
        if arquivo_codigos:
            df_nomes = pd.read_csv(io.StringIO(arquivo_codigos.file.read().decode("utf-8")))
            return dict(zip(df_nomes["Codigo_CRT"], df_nomes["Nome_Disciplina"]))

        try:
            df_nomes = pd.read_csv("../data/codigos_disciplinas.csv", encoding="utf-8")
            return dict(zip(df_nomes["Codigo_CRT"], df_nomes["Nome_Disciplina"]))
        except FileNotFoundError:
            try:
                req = urllib.request.Request(f"{self.daisy_api_url}/api/baixar_csv/Banco_de_Codigos_CRT.csv", method="GET")
                with urllib.request.urlopen(req, timeout=15) as resp:
                    conteudo = resp.read().decode("utf-8")
                    df_nomes = pd.read_csv(io.StringIO(conteudo))
                    return dict(zip(df_nomes["Codigo_CRT"], df_nomes["Nome_Disciplina"]))
            except Exception:
                pass
        return {}

    def _sincronizar_dataframe(self, nome_arquivo: str, dados: pd.DataFrame, mapa_nomes: dict):
        info = self.INFO_CURSOS[nome_arquivo]
        disciplinas_no_carrinho = set()

        existe_curso = self.db.query(CursoModel).filter_by(sigla=info["sigla"]).first()
        if not existe_curso:
            novo_curso = CursoModel(
                sigla=info["sigla"],
                nome=info["nome"],
                carga_horaria=info.get("carga_horaria", 3000)
            )
            self.db.add(novo_curso)
            self.db.flush()
        elif not existe_curso.carga_horaria:
            existe_curso.carga_horaria = info.get("carga_horaria", 3000)

        curso_atual = self.db.query(CursoModel).filter_by(sigla=info["sigla"]).first()

        for coluna in dados.columns:
            if coluna.startswith("CRT"):
                existe_no_banco = self.db.query(DisciplinaModel).filter_by(codigo=coluna).first()
                nome_disciplina = mapa_nomes.get(coluna, "A definir")
                if not existe_no_banco and coluna not in disciplinas_no_carrinho:
                    nova_disciplina = DisciplinaModel(codigo=coluna, nome=nome_disciplina)
                    self.db.add(nova_disciplina)
                    disciplinas_no_carrinho.add(coluna)
                elif existe_no_banco and existe_no_banco.nome == "A definir" and nome_disciplina != "A definir":
                    existe_no_banco.nome = nome_disciplina
        self.db.flush()

        for _, linha in dados.iterrows():
            matricula = int(linha["matricula"])
            aluno_banco = self.db.query(AlunoModel).filter_by(matricula=matricula).first()

            ira_val = float(linha["ira"]) if pd.notna(linha.get("ira")) else 0.0
            semestre_val = int(linha["semestre_em_que_o_aluno_está"]) if pd.notna(linha.get("semestre_em_que_o_aluno_está")) else 1
            ch_val = float(linha["ch_total"]) if pd.notna(linha.get("ch_total")) else 0.0
            tranc_val = int(linha["quantidade_de_trancamentos"]) if pd.notna(linha.get("quantidade_de_trancamentos")) else 0
            reprov_val = int(linha["quantidade_de_reprovações"]) if pd.notna(linha.get("quantidade_de_reprovações")) else 0
            media_val = float(linha["media_das_notas"]) if pd.notna(linha.get("media_das_notas")) else 0.0
            var_val = float(linha["variancia_das_notas"]) if pd.notna(linha.get("variancia_das_notas")) else 0.0
            cidade_val = str(linha["cidade_em_que_nasceu"]) if pd.notna(linha.get("cidade_em_que_nasceu")) else ""
            municipio_val = str(linha["município_em_que_mora"]) if pd.notna(linha.get("município_em_que_mora")) else ""

            if not aluno_banco:
                novo_aluno = AlunoModel(
                    matricula=matricula,
                    curso_id=curso_atual.id,
                    cidade_nasceu=cidade_val,
                    municipio_reside=municipio_val,
                    ira=ira_val,
                    formado=(str(linha["formado"]).strip().upper() == "SIM"),
                    semestre_atual=semestre_val,
                    ano_ingresso=str(linha["ano_de_ingresso"]),
                    prazo_conclusao=str(linha["prazo_para_terminar_o_curso"]),
                    ch_total=ch_val,
                    qtd_trancamentos=tranc_val,
                    total_reprovacoes=reprov_val,
                    media_notas=media_val,
                    variancia_notas=var_val
                )
                self.db.add(novo_aluno)
                self.db.flush()
            else:
                aluno_banco.curso_id = curso_atual.id
                aluno_banco.cidade_nasceu = cidade_val
                aluno_banco.municipio_reside = municipio_val
                aluno_banco.ira = ira_val
                aluno_banco.formado = (str(linha["formado"]).strip().upper() == "SIM")
                aluno_banco.semestre_atual = semestre_val
                aluno_banco.ano_ingresso = str(linha["ano_de_ingresso"])
                aluno_banco.prazo_conclusao = str(linha["prazo_para_terminar_o_curso"])
                aluno_banco.ch_total = ch_val
                aluno_banco.qtd_trancamentos = tranc_val
                aluno_banco.total_reprovacoes = reprov_val
                aluno_banco.media_notas = media_val
                aluno_banco.variancia_notas = var_val

            for coluna in dados.columns:
                if coluna.startswith("CRT"):
                    status_materia = int(linha[coluna]) if pd.notna(linha[coluna]) else 0
                    coluna_reprovacao = f"reprovado_vezes_{coluna}"
                    qtd_reprovacoes = int(linha[coluna_reprovacao]) if (coluna_reprovacao in dados.columns and pd.notna(linha[coluna_reprovacao])) else 0
                    if status_materia == 1 or qtd_reprovacoes > 0:
                        existe_historico = self.db.query(HistoricoDisciplinaModel).filter_by(
                            aluno_matricula=matricula,
                            disciplina_codigo=coluna
                        ).first()
                        if not existe_historico:
                            novo_historico = HistoricoDisciplinaModel(
                                aluno_matricula=matricula,
                                disciplina_codigo=coluna,
                                status_conclusao=(status_materia == 1),
                                qtd_reprovado=qtd_reprovacoes
                            )
                            self.db.add(novo_historico)
                        else:
                            existe_historico.status_conclusao = (status_materia == 1)
                            existe_historico.qtd_reprovado = qtd_reprovacoes
    @staticmethod
    def _dividir_em_lotes(ano_inicial: int, ano_final: int, tamanho: int = 3):
        if ano_inicial > ano_final:
            ano_inicial, ano_final = ano_final, ano_inicial
        lotes = []
        atual = ano_inicial
        while atual <= ano_final:
            fim = min(atual + tamanho - 1, ano_final)
            lotes.append((atual, fim))
            atual = fim + 1
        return lotes

    def _aguardar_extracao_daisy(self, intervalo_consulta: int = 3):
        while True:
            if STATUS_SYNC_AUTO["cancelado"]:
                try:
                    req = urllib.request.Request(f"{self.daisy_api_url}/api/cancelar_extracao", method="POST")
                    urllib.request.urlopen(req, timeout=5).close()
                except Exception:
                    pass
                return {"cancelado": True}

            time.sleep(intervalo_consulta)
            try:
                req = urllib.request.Request(f"{self.daisy_api_url}/api/status_extracao", method="GET")
                with urllib.request.urlopen(req, timeout=15) as resp:
                    status = json.loads(resp.read().decode("utf-8"))
                    if not status.get("em_andamento", False):
                        return status
            except Exception as e:
                print(f"Aguardando resposta do DAISY ({e})...")

    def extrair_e_sincronizar(
        self,
        ano_inicial: int,
        ano_final: int,
        cursos_selecionados: Optional[List[str]] = None,
        salvar_csv_local: bool = True
    ):
        lotes = self._dividir_em_lotes(ano_inicial, ano_final, self.TAMANHO_LOTE_ANOS)
        mapa_nomes = self._carregar_mapa_nomes()

        # Filtra apenas os cursos selecionados (aceita "cc.csv" ou "CC") ou usa todos se vazio
        if cursos_selecionados:
            selecionados_norm = {c.strip().lower() for c in cursos_selecionados}
            cursos_para_rodar = {
                arq: info
                for arq, info in self.INFO_CURSOS.items()
                if arq.lower() in selecionados_norm or info["sigla"].lower() in selecionados_norm
            }
            if not cursos_para_rodar:
                cursos_para_rodar = self.INFO_CURSOS
        else:
            cursos_para_rodar = self.INFO_CURSOS

        total_execucoes = len(cursos_para_rodar) * len(lotes)
        execucao_atual = 0

        STATUS_SYNC_AUTO.update({
            "em_andamento": True,
            "cancelado": False,
            "etapa": "extraindo",
            "lote_atual": 1,
            "total_lotes": total_execucoes,
            "progresso": 2,
            "curso_atual": "",
            "intervalo_atual": "",
            "segundos_pausa_restantes": 0,
            "mensagem": "Iniciando extração automática...",
            "lotes_falhos": [],
        })

        try:
            for nome_arquivo, info in cursos_para_rodar.items():
                for inicio_lote, fim_lote in lotes:
                    if STATUS_SYNC_AUTO["cancelado"]:
                        break

                    execucao_atual += 1
                    fatia_lote = 100.0 / total_execucoes
                    progresso_base = max(2, int(((execucao_atual - 1) * fatia_lote) + (fatia_lote * 0.05)))

                    STATUS_SYNC_AUTO.update({
                        "etapa": "extraindo",
                        "lote_atual": execucao_atual,
                        "progresso": progresso_base,
                        "curso_atual": info["nome"],
                        "intervalo_atual": f"{inicio_lote}–{fim_lote}",
                        "segundos_pausa_restantes": 0,
                        "mensagem": f"Extraindo {info['nome']} ({inicio_lote}–{fim_lote}) no SIGAA...",
                    })

                    payload = json.dumps({
                        "curso": info["nome_sigaa"],
                        "ano_inicial": inicio_lote,
                        "ano_final": fim_lote,
                        "nome_arquivo": nome_arquivo
                    }).encode("utf-8")

                    req_inicio = urllib.request.Request(
                        f"{self.daisy_api_url}/api/iniciar_extracao",
                        data=payload,
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    try:
                        urllib.request.urlopen(req_inicio, timeout=15).close()
                    except urllib.error.HTTPError as err:
                        if err.code == 409:
                            pass
                        else:
                            raise err

                    status_final = self._aguardar_extracao_daisy()

                    if STATUS_SYNC_AUTO["cancelado"]:
                        break

                    # 1. Verifica se algum ano dentro do lote ficou incompleto (ex: 7/17 alunos salvos)
                    resumo_anos = status_final.get("resumo_anos") or []
                    anos_incompletos_registrados = set()
                    for item_ano in resumo_anos:
                        encontrados = item_ano.get("encontrados", 0)
                        salvos = item_ano.get("salvos", 0)
                        ano_ref = item_ano.get("ano", inicio_lote)
                        status_ref = item_ano.get("status", "")
                        if encontrados > salvos:
                            anos_incompletos_registrados.add(ano_ref)
                            STATUS_SYNC_AUTO["lotes_falhos"].append({
                                "curso": info["nome"],
                                "sigla": info["sigla"],
                                "ano_inicial": ano_ref,
                                "ano_final": ano_ref,
                                "erro": (
                                    f"Ano {ano_ref} ({status_ref}) ficou incompleto: "
                                    f"{salvos} de {encontrados} alunos extraídos. "
                                    f"Rode novamente apenas o ano {ano_ref}."
                                ),
                                "detalhe": f"{salvos}/{encontrados} salvos",
                            })

                    # Fallback: se veio algum aviso do DAISY que não estava em resumo_anos
                    for aviso in (status_final.get("avisos") or []):
                        if "ficou incompleto" in aviso and not anos_incompletos_registrados:
                            STATUS_SYNC_AUTO["lotes_falhos"].append({
                                "curso": info["nome"],
                                "sigla": info["sigla"],
                                "ano_inicial": inicio_lote,
                                "ano_final": fim_lote,
                                "erro": f"{aviso} Rode novamente este período.",
                                "detalhe": aviso,
                            })

                    # 2. Se o lote inteiro falhou após as 3 tentativas
                    if status_final.get("erro"):
                        STATUS_SYNC_AUTO["lotes_falhos"].append({
                            "curso": info["nome"],
                            "sigla": info["sigla"],
                            "ano_inicial": inicio_lote,
                            "ano_final": fim_lote,
                            "erro": "O SIGAA não respondeu após 3 tentativas. Rode novamente este período.",
                            "detalhe": status_final["erro"],
                        })
                        print(f"⚠️ Lote falhou: {info['nome']} ({inicio_lote}-{fim_lote})")

                        # Pula o download (daria 404), mas respeita a pausa e segue para o próximo lote
                        STATUS_SYNC_AUTO["progresso"] = max(
                            STATUS_SYNC_AUTO["progresso"],
                            min(99, int((execucao_atual / total_execucoes) * 100)),
                        )
                        if execucao_atual < total_execucoes:
                            STATUS_SYNC_AUTO["etapa"] = "pausa"
                            for restante in range(self.TEMPO_PAUSA_SEGUNDOS, 0, -1):
                                if STATUS_SYNC_AUTO["cancelado"]:
                                    break
                                STATUS_SYNC_AUTO["segundos_pausa_restantes"] = restante
                                minutos, segs = divmod(restante, 60)
                                STATUS_SYNC_AUTO["mensagem"] = (
                                    f"Lote {execucao_atual}/{total_execucoes} falhou. "
                                    f"Aguardando {minutos:02d}:{segs:02d} para o próximo..."
                                )
                                time.sleep(1)
                        continue

                    progresso_sincronizando = int(((execucao_atual - 1) * fatia_lote) + (fatia_lote * 0.85))
                    STATUS_SYNC_AUTO.update({
                        "etapa": "sincronizando",
                        "progresso": max(STATUS_SYNC_AUTO["progresso"], min(99, progresso_sincronizando)),
                        "mensagem": f"Salvando dados de {info['nome']} ({inicio_lote}–{fim_lote}) no banco...",
                    })

                    try:
                        req_csv = urllib.request.Request(f"{self.daisy_api_url}/api/baixar_csv/{nome_arquivo}", method="GET")
                        with urllib.request.urlopen(req_csv, timeout=30) as resp_csv:
                            conteudo_bytes = resp_csv.read()
                            if salvar_csv_local:
                                with open(nome_arquivo, "wb") as f:
                                    f.write(conteudo_bytes)

                            dados = pd.read_csv(io.StringIO(conteudo_bytes.decode("utf-8")))
                            self._sincronizar_dataframe(nome_arquivo, dados, mapa_nomes)
                            self.db.commit()
                    except urllib.error.HTTPError:
                        print(f"ℹ️ Nenhum aluno encontrado para {info['nome']} ({inicio_lote}-{fim_lote}).")

                    if execucao_atual < total_execucoes and not STATUS_SYNC_AUTO["cancelado"]:
                        STATUS_SYNC_AUTO["etapa"] = "pausa"
                        for restante in range(self.TEMPO_PAUSA_SEGUNDOS, 0, -1):
                            if STATUS_SYNC_AUTO["cancelado"]:
                                break
                            STATUS_SYNC_AUTO["segundos_pausa_restantes"] = restante
                            # Avança de 85% até 100% da fatia do lote durante os 120s de pausa
                            fracao_pausa = (self.TEMPO_PAUSA_SEGUNDOS - restante) / float(self.TEMPO_PAUSA_SEGUNDOS)
                            progresso_pausa = int(((execucao_atual - 1) * fatia_lote) + (fatia_lote * (0.85 + 0.15 * fracao_pausa)))
                            STATUS_SYNC_AUTO["progresso"] = max(STATUS_SYNC_AUTO["progresso"], min(99, progresso_pausa))

                            minutos, segs = divmod(restante, 60)
                            STATUS_SYNC_AUTO["mensagem"] = (
                                f"Lote {execucao_atual}/{total_execucoes} salvo! "
                                f"Aguardando {minutos:02d}:{segs:02d} para iniciar o próximo lote..."
                            )
                            time.sleep(1)
                    else:
                        progresso_concluido = int((execucao_atual / total_execucoes) * 100)
                        STATUS_SYNC_AUTO["progresso"] = progresso_concluido

                if STATUS_SYNC_AUTO["cancelado"]:
                    break

            if STATUS_SYNC_AUTO["cancelado"]:
                STATUS_SYNC_AUTO.update({
                    "em_andamento": False,
                    "etapa": "cancelado",
                    "segundos_pausa_restantes": 0,
                    "mensagem": "Extração cancelada pelo usuário. Os lotes já finalizados foram mantidos no banco.",
                })
                return {"mensagem": STATUS_SYNC_AUTO["mensagem"]}

            falhos = STATUS_SYNC_AUTO["lotes_falhos"]
            STATUS_SYNC_AUTO.update({
                "em_andamento": False,
                "etapa": "concluido_com_falhas" if falhos else "concluido",
                "progresso": 100,
                "segundos_pausa_restantes": 0,
                "mensagem": (
                    f"Concluído com {len(falhos)} pendência(s) (lotes falhos ou anos incompletos). "
                    f"Rode novamente apenas os anos indicados abaixo."
                    if falhos else
                    f"Sincronização concluída com sucesso ({ano_inicial}–{ano_final})!"
                ),
            })
            return {"mensagem": STATUS_SYNC_AUTO["mensagem"]}

        except Exception as e:
            self.db.rollback()
            STATUS_SYNC_AUTO.update({
                "em_andamento": False,
                "etapa": "erro",
                "segundos_pausa_restantes": 0,
                "mensagem": f"Erro durante a sincronização: {str(e)}",
            })
            raise e

    def executar(self, arquivos: List[UploadFile]):
        arquivos_cursos = [f for f in arquivos if f.filename in self.INFO_CURSOS.keys()]
        arquivo_codigos = next((f for f in arquivos if f.filename == "codigos_disciplinas.csv"), None)

        if not arquivos_cursos:
            return {"mensagem": "Nenhum arquivo de curso válido (cc.csv, ec.csv, etc) foi enviado."}

        mapa_nomes = self._carregar_mapa_nomes(arquivo_codigos)

        try:
            for arquivo in arquivos_cursos:
                conteudo = arquivo.file.read()
                dados = pd.read_csv(io.StringIO(conteudo.decode("utf-8")))
                self._sincronizar_dataframe(arquivo.filename, dados, mapa_nomes)

            self.db.commit()
            return {"mensagem": "Sincronização dos dados concluída com sucesso!"}

        except Exception as e:
            self.db.rollback()
            raise e