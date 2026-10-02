from app.infrastructure.repositories.aluno_repository import AlunoRepository

class ListarAlunosUseCase:
    def __init__(self, repository: AlunoRepository):
        self.repository = repository

    def executar(self, pular: int=0, limite: int=100, curso_id: int=None):
        alunos = self.repository.listar_todos(pular, limite, curso_id)
        return alunos