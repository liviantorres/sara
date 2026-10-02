from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm 
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.application.dtos.autenticacao_dto import RegistroUsuarioInput, LoginUsuarioInput, TokenOutput
from app.application.use_cases.autenticacao_use_cases import RegistrarUsuarioUseCases, LoginUsuarioUseCase

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/registrar", status_code=status.HTTP_201_CREATED)
def registrar(payload: RegistroUsuarioInput, db: Session = Depends(get_db)):
    use_case = RegistrarUsuarioUseCases(db)
    
    try:
        return use_case.executar(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenOutput)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    payload = LoginUsuarioInput(email=form_data.username, senha=form_data.password)
    
    use_case = LoginUsuarioUseCase(db)
    
    try:
        return use_case.executar(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))