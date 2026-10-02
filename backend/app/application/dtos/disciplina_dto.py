from pydantic import BaseModel
from typing import Optional

class DisciplinaResponse(BaseModel):
    codigo: str
    nome: Optional[str] = None

    class Config:
        from_attributes = True