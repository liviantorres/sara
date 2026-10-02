from app.infrastructure.repositories.curso_repository import CursoRepository

class ListarCursosUseCases:
    def __init__(self, repository: CursoRepository):
        self.repository = repository

    def executar(self):
        return self.repository.listar_todos()
