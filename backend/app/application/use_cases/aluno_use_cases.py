from app.infrastructure.repositories.aluno_repository import AlunoRepository

class ListarAlunosUseCases:
    def __init__(self, repository: AlunoRepository):
        self.repository = repository

    def executar(self, pular: int=0, limite: int=100, curso_id: int=None, matricula: int=None,
                 formado: bool=None, ira_max: float=None, semestre: int=None):
        alunos = self.repository.listar_todos(pular, limite, curso_id, matricula, formado, ira_max, semestre)
        return alunos

    def obter_estatisticas(self, curso_id: int = None, matricula: int = None, 
                           formado: bool = None, ira_max: float = None, semestre: int = None):
        return self.repository.obter_estatisticas(curso_id, matricula, formado, ira_max, semestre)