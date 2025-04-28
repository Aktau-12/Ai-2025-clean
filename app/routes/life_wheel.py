from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.life_wheel import LifeWheel
from app.models.user import User
from app.routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/life-wheel", tags=["Life Wheel"])

class LifeWheelCreate(BaseModel):
    scores: dict[str, int]  # ключ — сфера жизни, значение — оценка 1-10

@router.post("/save")
def save_life_wheel(data: LifeWheelCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_entry = LifeWheel(user_id=user.id, scores=data.scores)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Оценка Колеса Жизни сохранена", "id": new_entry.id}

@router.get("/my")
def get_my_life_wheel(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    entries = db.query(LifeWheel).filter(LifeWheel.user_id == user.id).order_by(LifeWheel.timestamp.desc()).all()
    return [{"id": e.id, "scores": e.scores, "timestamp": e.timestamp} for e in entries]
