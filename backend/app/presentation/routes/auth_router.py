from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.dtos.auth_dto import UserRegisterInput, UserLoginInput, TokenOutput
from app.application.use_cases.auth_use_cases import RegisterUserUseCase, LoginUserUseCase
from app.infrastructure.repositories.user_repository_impl import SqlAlchemyUserRepository
from app.infrastructure.db.session import get_db  # Dependência que cede a Session do SQLAlchemy

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterInput, db: Session = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    use_case = RegisterUserUseCase(repo)
    try:
        return use_case.execute(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenOutput)
def login(payload: UserLoginInput, db: Session = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    use_case = LoginUserUseCase(repo)
    try:
        return use_case.execute(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))