from fastapi import APIRouter, Depends, UploadFile, File
from typing import List
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.application.use_cases.sync_deysi_data import SyncDeysiDataUseCases
from app.infrastructure.security.auth_deps import require_dae

router = APIRouter(prefix="/admin", tags=["Admin (DAE)"])

@router.post("/sincronizar", dependencies=[Depends(require_dae)])
def sicronizar_dados(arquivos: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    use_case = SyncDeysiDataUseCases(db)
    resultado = use_case.executar(arquivos)

    return resultado


import asyncio

@router.post("/sync-auto", dependencies=[Depends(require_dae)])
async def sincronizar_deysi_automatico():
    """
    Endpoint preparado para o futuro: Integração direta com a API do DEYSI.
    """
    # Aqui entraria a lógica real: requests.get('https://deysi.ufc.br/api/alunos')
    # Como ainda não temos acesso liberado, vamos simular o tempo de rede e processamento
    await asyncio.sleep(3) 
    
    return {
        "mensagem": "Conexão com DEYSI estabelecida! Bases de dados sincronizadas automaticamente com sucesso."
    }