from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.aluno_repository import AlunoRepository
from app.application.use_cases.aluno_use_cases import ListarAlunosUseCases
from app.application.dtos.aluno_dto import AlunoResponse

router = APIRouter(tags=["Alunos"])

@router.get("/alunos", response_model=List[AlunoResponse])
def listar_alunos(pular: int=0, limite: int=100,curso_id: Optional[int]=None,
                  matricula: Optional[int]=None, formado: Optional[bool]=None, 
                  ira_max: Optional[float]=None, semestre: Optional[int]=None,
                   db: Session = Depends(get_db)):
    
    repository = AlunoRepository(db)
    use_case = ListarAlunosUseCases(repository)

    alunos = use_case.executar(pular=pular, limite=limite, curso_id=curso_id, matricula=matricula, formado=formado, ira_max=ira_max, semestre=semestre)

    return alunos

@router.get("/alunos/estatisticas")
def obter_estatisticas_alunos(
    curso_id: Optional[int] = None,
    matricula: Optional[int] = None,
    formado: Optional[bool] = None,
    ira_max: Optional[float] = None,
    semestre: Optional[int] = None,
    db: Session = Depends(get_db)
    ):
    repository = AlunoRepository(db)
    use_case = ListarAlunosUseCases(repository)
    
    return use_case.obter_estatisticas(
    curso_id=curso_id, matricula=matricula, formado=formado, ira_max=ira_max, semestre=semestre
    )