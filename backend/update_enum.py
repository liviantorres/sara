from app.infrastructure.db.session import SessionLocal
from sqlalchemy import text
db = SessionLocal()
db.execute(text("ALTER TYPE papelusuario RENAME VALUE 'ADMIN' TO 'dae';"))
db.execute(text("ALTER TYPE papelusuario RENAME VALUE 'USUARIO' TO 'coordenacao';"))
db.commit()
print('Concluido')
