from pydantic import BaseModel, EmailStr

class UserRegisterInput(BaseModel):
    nome: str 
    email: EmailStr
    password: str

class UserLoginInput(BaseModel):
    email: EmailStr
    password: str

class UserLoginData(BaseModel):
    nome: str 
    email: str
    
class TokenOutput(BaseModel):
    access_token: str
    token_type: str
    user: UserLoginData  