from fastapi import APIRouter, Depends
from  sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.application.use_cases.sync_deysi_data import SyncDeysiDataUseCase
from app.infrastructure.security.auth_deps import require_admin

router = APIRouter(prefix="/admin", tags=["Admin (DAE)"])

@router.post("/sincronizar", dependencies=[Depends(require_admin)])
def sicronizar_dados(db: Session = Depends(get_db)):
    
    use_case = SyncDeysiDataUseCase(db)
    resultado = use_case.executar()

    return resultado