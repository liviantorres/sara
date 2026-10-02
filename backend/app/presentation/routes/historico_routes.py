from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.infrastructure.db.session import get_db
from app.application.dtos.historico_dto import HistoricoResponse
from app.application.use_cases.historico_use_cases import ListarHistoricosUseCases
from app.infrastructure.repositories.historico_repository import HistoricoRepository

router = APIRouter()

@router.get("/historicos", response_model=List[HistoricoResponse])
def listar_historicos(pular: int=0, limite: int=100, aluno_matricula: Optional[int]=None, db:Session = Depends(get_db)):
    repository = HistoricoRepository(db)
    use_case = ListarHistoricosUseCases(repository)

    historicos = use_case.executar(pular=pular, limite=limite, aluno_matricula=aluno_matricula)
    
    return historicos