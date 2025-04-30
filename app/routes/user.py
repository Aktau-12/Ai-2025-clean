from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.hero import UserHeroProgress
from app.database.db import SessionLocal
from app.routes.auth import get_current_user
from pydantic import BaseModel
from passlib.hash import bcrypt

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

@router.post("/register", response_model=dict)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="⛔ Этот email уже зарегистрирован")

    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password,
        archetype=None  # ✅ Явная инициализация архетипа
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ Создаём начальный прогресс героя
    progress = UserHeroProgress(user_id=user.id, xp=0)
    db.add(progress)
    db.commit()

    return {
        "message": "✅ Пользователь успешно зарегистрирован!",
        "user_id": user.id
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "mbti_type": user.mbti_type,
        "archetype": user.archetype,
        "created_at": user.created_at,
    }
