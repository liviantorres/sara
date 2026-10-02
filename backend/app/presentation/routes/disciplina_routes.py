from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.disciplina_repository import DisciplinaRepository
from app.application.use_cases.disciplina_use_cases import ListarDisciplinasUseCases
from app.application.dtos.disciplina_dto import DisciplinaResponse

router = APIRouter()

@router.get("/disciplinas", response_model= List[DisciplinaResponse])
def listar_disciplinas(pular: int=0, limite: int=100, db: Session = Depends(get_db)):
    repository = DisciplinaRepository(db)
    use_case = ListarDisciplinasUseCases(repository)

    disciplinas = use_case.executar(pular, limite)
    
    return disciplinas

