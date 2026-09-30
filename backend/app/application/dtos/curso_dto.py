from pydantic import BaseModel

class CursoResponse(BaseModel):
    id: int
    sigla: str
    nome: str

    class Config:
        from_attributes = True