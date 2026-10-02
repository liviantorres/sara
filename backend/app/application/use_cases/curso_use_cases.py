from app.infrastructure.repositories.curso_repository import CursoRepository

class ListarCursosUseCase:
    def __init__(self, repository: CursoRepository):
        self.repository = repository

    def executar(self):
        cursos = self.repository.listar_todos()

        return cursos