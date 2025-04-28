# app/routes/thinking_algorithm.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.thinking_algorithm import ThinkingAlgorithm
from app.models.user import User
from app.routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/thinking", tags=["Thinking Algorithm"])

class ThinkingCreate(BaseModel):
    answers: list[str]

@router.post("/save")
def save_thinking(data: ThinkingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_entry = ThinkingAlgorithm(user_id=user.id, answers=data.answers)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Ответы успешно сохранены", "id": new_entry.id}

@router.get("/my")
def get_my_thinking_entries(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    entries = db.query(ThinkingAlgorithm).filter(ThinkingAlgorithm.user_id == user.id).order_by(ThinkingAlgorithm.timestamp.desc()).all()
    return [{"id": e.id, "answers": e.answers, "timestamp": e.timestamp} for e in entries]
