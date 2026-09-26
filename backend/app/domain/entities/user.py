from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: Optional[int]
    nome: str
    email: str
    password_hash: str