from pydantic import BaseModel
from typing import Optional

class AlunoResponse(BaseModel):
    matricula: int
    curso_id: int
    cidade_nasceu: Optional[str] = None
    municipio_reside: Optional[str] = None
    ira: Optional[float] = None
    formado: Optional[bool] = None
    semestre_atual: Optional[int] = None
    ano_ingresso: Optional[str] = None
    prazo_conclusao: Optional[str] = None
    ch_total: Optional[float] = None
    qtd_trancamentos: Optional[int] = None
    total_reprovacoes: Optional[int] = None
    media_notas: Optional[float] = None
    variancia_notas: Optional[float] = None

    class Config:
        from_attributes = True