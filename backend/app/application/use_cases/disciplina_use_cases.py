from app.infrastructure.repositories.disciplina_repository import DisciplinaRepository

class ListarDisciplinasUseCases:
    def __init__(self, repository: DisciplinaRepository):
        self.repository = repository

    def executar(self):
        disciplinas = self.repository.listar_todos()

        return disciplinas