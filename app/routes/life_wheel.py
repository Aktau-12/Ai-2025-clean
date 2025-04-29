# app/routes/life_wheel.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.schemas.life_wheel import LifeWheelSchema
from app.routes.auth import get_current_user

router = APIRouter(prefix="/life-wheel", tags=["Life Wheel"])

@router.post("/save")
def save_life_wheel(
    data: LifeWheelSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Здесь можно сохранить данные в БД.
        # Пока просто печатаем в консоль (заготовка):
        print(f"Saving Life Wheel for user {current_user.id}: {data.scores}")

        # Тут ты потом добавишь реальное сохранение в таблицу.
        return {"message": "Life Wheel saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при сохранении колеса жизни: {str(e)}")
