from pydantic import BaseModel
from typing import Optional

class HistoricoResponse(BaseModel):
    aluno_matricula: int
    disciplina_codigo: str
    status_conclusao: Optional[bool] = None
    qtd_reprovado: Optional[int] = None

    class Config:
        from_attributes = True