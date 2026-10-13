from pydantic import BaseModel
from typing import Optional

class HistoricoResponse(BaseModel):
    aluno_matricula: int
    disciplina_codigo: str
    disciplina_nome: Optional[str] = None
    status_conclusao: Optional[bool] = None
    qtd_reprovado: Optional[int] = None

    class Config:
        from_attributes = True