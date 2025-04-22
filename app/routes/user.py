from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database.db import SessionLocal
from app.models.user import User
from app.models.hero import UserHeroProgress
from app.routes.auth import get_current_user
from app.schemas.user import UserCreate, UserResponse  # 👈 импорт схем

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 🔌 Получение сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔒 Хеширование пароля
def hash_password(password: str):
    return pwd_context.hash(password)


# ✅ Регистрация нового пользователя с прогрессом героя
@router.post("/register", response_model=dict)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="⛔ Этот email уже зарегистрирован")

    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ Создаём прогресс героя
    progress = UserHeroProgress(user_id=user.id, xp=0)
    db.add(progress)
    db.commit()

    return {
        "message": "✅ Пользователь успешно зарегистрирован!",
        "user_id": user.id
    }


# 👤 Получение текущего пользователя
@router.get("/me", response_model=UserResponse)
def get_user_me(user: User = Depends(get_current_user)):
    xp = user.hero_progress.xp if user.hero_progress else 0
    return {
        "email": user.email,
        "name": user.name,
        "id": user.id,
        "xp": xp,
        "mbti_type": user.mbti_type  # ✅ MBTI тип включён
    }
