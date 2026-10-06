from app.infrastructure.repositories.disciplina_repository import DisciplinaRepository

class ListarDisciplinasUseCases:
    def __init__(self, repository: DisciplinaRepository):
        self.repository = repository

    def executar(self, pular: int=0, limite: int=100):
        disciplinas = self.repository.listar_todos(pular, limite)

        return disciplinas

class ObterRankingDisciplinasUseCase:
    def __init__(self, repository):
        self.repository = repository

    def executar(self, curso_id: int = None, limite: int = 50):
        return self.repository.obter_ranking(curso_id=curso_id, limite=limite)