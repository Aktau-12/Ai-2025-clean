from pydantic import BaseModel
from typing import Optional

class RegisterSchema(BaseModel):
    email: str
    name: Optional[str] = None
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
