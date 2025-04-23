# user.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy import Column, Integer, String
from app.database.db import Base  # ✅ базовый класс SQLAlchemy

# 🔧 SQLAlchemy-модель для БД
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    xp = Column(Integer, default=0)
    mbti_type = Column(String, nullable=True)

# ✅ Схемы Pydantic

class RegisterSchema(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    xp: int
    mbti_type: Optional[str] = None

    class Config:
        from_attributes = True  # 🔄 позволяет преобразовать из SQLAlchemy-модели
