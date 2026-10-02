from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.aluno_repository import AlunoRepository
from app.application.use_cases.aluno_use_cases import ListarAlunosUseCase
from app.application.dtos.aluno_dto import AlunoResponse

router = APIRouter()

@router.get("/alunos", response_model=List[AlunoResponse])
def listar_alunos(pular: int=0, limite: int=100,curso_id: Optional[int]=None, db: Session = Depends(get_db)):
    repository = AlunoRepository(db)
    use_case = ListarAlunosUseCase(repository)

    alunos = use_case.executar(pular=pular, limite=limite, curso_id=curso_id)

    return alunos