from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.hero import UserHeroProgress
from app.database.db import SessionLocal
from app.routes.auth import get_current_user, get_password_hash  # ✅ импортируем get_password_hash
from pydantic import BaseModel

router = APIRouter()

# ✅ Подключение к базе данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Модель данных для регистрации
class UserCreate(BaseModel):
    email: str
    password: str
    name: str

# ✅ Регистрация нового пользователя
@router.post("/register", response_model=dict)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="⛔ Этот email уже зарегистрирован")

    hashed_password = get_password_hash(user_data.password)  # ✅ используем ту же функцию

    try:
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hashed_password,
            archetype=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)  # ✅ подтягиваем ID из базы

        # Проверяем, есть ли прогресс героя
        progress = db.query(UserHeroProgress).filter_by(user_id=user.id).first()
        if not progress:
            progress = UserHeroProgress(user_id=user.id, xp=0)
            db.add(progress)
            db.commit()

        return {
            "message": "✅ Пользователь успешно зарегистрирован!",
            "user_id": user.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"❌ Ошибка регистрации: {str(e)}")

# ✅ Получение текущего пользователя
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
