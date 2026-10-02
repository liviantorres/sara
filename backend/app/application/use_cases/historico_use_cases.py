from app.infrastructure.repositories.historico_repository import HistoricoRepository

class ListarHistoricosUseCases:
    def __init__(self, repository: HistoricoRepository):
        self.repository = repository

    def executar(self, pular: int=0, limite: int=100, aluno_matricula: int=None):
        historicos = self.repository.listar_todos(pular, limite, aluno_matricula)
        return historicos
