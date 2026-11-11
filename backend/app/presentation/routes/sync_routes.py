from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import threading

from app.infrastructure.db.session import get_db
from app.application.use_cases.sync_deysi_data import SyncDeysiDataUseCases, STATUS_SYNC_AUTO
from app.infrastructure.security.auth_deps import require_dae

router = APIRouter(prefix="/admin", tags=["Admin (DAE)"])


class SyncAutoRequest(BaseModel):
    ano_inicial: int = 2016
    ano_final: int = 2024
    cursos: Optional[List[str]] = None  


def _executar_sync_em_background(ano_inicial: int, ano_final: int, cursos: Optional[List[str]] = None):
    db_gen = get_db()
    db = next(db_gen)
    try:
        use_case = SyncDeysiDataUseCases(db)
        use_case.extrair_e_sincronizar(
            ano_inicial=ano_inicial,
            ano_final=ano_final,
            cursos_selecionados=cursos
        )
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


@router.post("/sincronizar", dependencies=[Depends(require_dae)])
def sicronizar_dados(arquivos: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    use_case = SyncDeysiDataUseCases(db)
    return use_case.executar(arquivos)


@router.post("/sync-auto", dependencies=[Depends(require_dae)])
def sincronizar_deysi_automatico(
    dados: Optional[SyncAutoRequest] = None,
    db: Session = Depends(get_db),
):
    use_case = SyncDeysiDataUseCases(db)
    status_atual = use_case.obter_status_atual()
    if status_atual["em_andamento"]:
        return status_atual

    if not use_case.verificar_conexao_daisy():
        raise HTTPException(
            status_code=503,
            detail=f"Servidor do DEYSI não encontrado em {use_case.daisy_api_url}. Verifique se o container está rodando."
        )

    inicio = dados.ano_inicial if dados else 2016
    fim = dados.ano_final if dados else 2024
    cursos = dados.cursos if dados else None

    STATUS_SYNC_AUTO.update({
        "em_andamento": True,
        "cancelado": False,
        "etapa": "extraindo",
        "progresso": 2,
        "mensagem": f"Iniciando extração automática de {inicio} até {fim}...",
    })

    thread = threading.Thread(
        target=_executar_sync_em_background,
        args=(inicio, fim, cursos),
        daemon=True
    )
    thread.start()

    return {
        "mensagem": f"Extração automática iniciada de {inicio} até {fim}!"
    }


@router.get("/sync-status", dependencies=[Depends(require_dae)])
def obter_status_sync():
    use_case = SyncDeysiDataUseCases()
    return use_case.obter_status_atual()


@router.post("/sync-cancel", dependencies=[Depends(require_dae)])
def cancelar_sync():
    use_case = SyncDeysiDataUseCases()
    return use_case.cancelar_sincronizacao()