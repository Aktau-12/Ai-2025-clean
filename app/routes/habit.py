from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.habit import Habit, UserHabit
from app.models.user import User
from app.routes.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/habits", tags=["Habits"])  # ✅ добавил префикс

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 📦 Модель для создания привычки пользователем
class UserHabitCreate(BaseModel):
    habit_id: int
    days: List[int]

# 📦 Модель создания новой привычки в систему
class HabitCreate(BaseModel):
    title: str
    category: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

# 🔹 Получить все шаблоны привычек
@router.get("/", response_model=List[dict])
def get_all_habits(db: Session = Depends(get_db)):
    habits = db.query(Habit).all()
    return [
        {
            "id": h.id,
            "title": h.title,
            "category": h.category,
            "image_url": h.image_url,
            "description": h.description
        }
        for h in habits
    ]

# 🔹 Добавить новую привычку (шаблон — для админа)
@router.post("/", status_code=201)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    new = Habit(**habit.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return {"id": new.id, "message": "🆕 Привычка добавлена"}

# 🔸 Добавить привычку пользователю
@router.post("/my", status_code=201)
def add_user_habit(
    habit_data: UserHabitCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(Habit.id == habit_data.habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Привычка не найдена")

    existing = db.query(UserHabit).filter_by(user_id=user.id, habit_id=habit.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Эта привычка уже добавлена")

    user_habit = UserHabit(
        user_id=user.id,
        habit_id=habit.id,
        days=habit_data.days,
        start_date=datetime.utcnow()
    )
    db.add(user_habit)
    db.commit()
    return {"message": "✅ Привычка добавлена пользователю"}

# 🔹 Получить привычки пользователя
@router.get("/my", response_model=List[dict])
def get_user_habits(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    habits = (
        db.query(UserHabit, Habit)
        .join(Habit, Habit.id == UserHabit.habit_id)
        .filter(UserHabit.user_id == user.id)
        .all()
    )
    return [
        {
            "id": uh.id,
            "title": h.title,
            "image_url": h.image_url,
            "days": uh.days,
            "done_today": uh.done_today,
            "streak": uh.streak
        }
        for uh, h in habits
    ]

# 🔘 Отметить привычку как выполненную сегодня
@router.post("/my/{habit_id}/check")
def check_habit_done(
    habit_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    user_habit = db.query(UserHabit).filter(UserHabit.id == habit_id, UserHabit.user_id == user.id).first()
    if not user_habit:
        raise HTTPException(status_code=404, detail="Привычка не найдена")

    if user_habit.done_today:
        raise HTTPException(status_code=400, detail="Уже отмечено на сегодня")

    user_habit.done_today = True
    user_habit.streak += 1
    db.commit()
    return {"message": "🎯 Привычка отмечена как выполненная сегодня!"}
