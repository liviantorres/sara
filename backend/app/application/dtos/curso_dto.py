from pydantic import BaseModel
from typing import Optional

class CursoResponse(BaseModel):
    id: int
    sigla: str
    nome: str
    carga_horaria: Optional[int] = 3000

    class Config:
        from_attributes = True