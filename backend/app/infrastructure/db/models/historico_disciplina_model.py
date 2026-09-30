from sqlalchemy import String, Integer, Column, Boolean, ForeignKey
from app.infrastructure.db.session import Base

class HistoricoDisciplinaModel(Base):

    __tablename__ = "historico_disciplina"

    aluno_matricula = Column(Integer, ForeignKey("aluno.matricula"), primary_key=True)
    disciplina_codigo = Column(String(200), ForeignKey("disciplina.codigo"), nullable=False, primary_key=True)
    status_conclusao = Column(Boolean)
    qtd_reprovado = Column(Integer)



