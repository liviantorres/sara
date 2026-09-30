from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.curso_repository import CursoRepository
from app.application.use_cases.listar_cursos_use_case import ListarCursosUseCase
from app.application.dtos.curso_dto import CursoResponse

router = APIRouter()

@router.get("/cursos", response_model=List[CursoResponse])
def listar_cursos(db: Session = Depends(get_db)):
    repository = CursoRepository(db)
    use_case = ListarCursosUseCase(repository)

    cursos = use_case.executar()

    return cursos