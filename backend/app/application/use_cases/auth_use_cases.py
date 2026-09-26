from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.application.dtos.auth_dto import UserRegisterInput, UserLoginInput, TokenOutput
from app.infrastructure.security.security_service import hash_password, verify_password, create_access_token

class RegisterUserUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def execute(self, data: UserRegisterInput) -> dict:
        if self.user_repo.get_by_email(data.email):
            raise ValueError("Email já cadastrado.")

        new_user = User(
            id=None,
            nome=data.nome,
            email=data.email,
            password_hash=hash_password(data.password)
        )
        created_user = self.user_repo.create(new_user)
        return {"id": created_user.id, "email": created_user.email}


class LoginUserUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def execute(self, data: UserLoginInput) -> TokenOutput:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise ValueError("Credenciais inválidas.")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return TokenOutput(access_token=token)