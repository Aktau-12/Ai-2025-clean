# app/routes/thinking_algorithm.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.thinking_algorithm import ThinkingAlgorithm
from app.routes.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
import json

router = APIRouter(tags=["ThinkingAlgorithm"])

class ThinkingAlgorithmSubmission(BaseModel):
    answers: list[str]

@router.post("/thinking-algorithm/submit")
def submit_thinking_algorithm(
    submission: ThinkingAlgorithmSubmission,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    new_entry = ThinkingAlgorithm(
        user_id=user.id,
        answers=json.dumps(submission.answers)
    )
    db.add(new_entry)
    db.commit()
    return {"message": "🎯 Алгоритм мышления сохранён!"}
