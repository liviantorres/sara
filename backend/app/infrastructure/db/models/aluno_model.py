from app.infrastructure.db.session import Base
from sqlalchemy import String, Integer, Float, Column, Boolean, ForeignKey


class AlunoModel(Base):

    __tablename__ = "aluno"

    matricula = Column(Integer, primary_key=True, index=True)
    curso_id = Column(Integer, ForeignKey("curso.id"), nullable=False)
    cidade_nasceu = Column(String(100))
    municipio_reside = Column(String(100))
    ira = Column(Float)
    formado = Column(Boolean)
    semestre_atual = Column(Integer)
    ano_ingresso = Column(String(100))
    prazo_conclusao = Column(String(100))
    ch_total = Column(Float)
    qtd_trancamentos = Column(Integer)
    total_reprovacoes = Column(Integer)
    media_notas = Column(Float)
    variancia_notas = Column(Float)


