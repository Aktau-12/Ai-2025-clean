from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    xp: int
    mbti_type: Optional[str] = None  # 🧠 Добавлено поле MBTI

    class Config:
        from_attributes = True  # для SQLAlchemy моделей
