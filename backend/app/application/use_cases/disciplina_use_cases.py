from app.infrastructure.repositories.disciplina_repository import DisciplinaRepository

class ListarDisciplinasUseCases:
    def __init__(self, repository: DisciplinaRepository):
        self.repository = repository

    def executar(self, pular: int=0, limite: int=100):
        disciplinas = self.repository.listar_todos(pular, limite)

        return disciplinas