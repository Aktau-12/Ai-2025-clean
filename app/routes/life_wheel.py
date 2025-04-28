from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.life_wheel import LifeWheelResult
from app.routes.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
import json

router = APIRouter(tags=["LifeWheel"])

class LifeWheelSubmission(BaseModel):
    scores: dict[str, int]

@router.post("/life-wheel/submit")
def submit_life_wheel(
    submission: LifeWheelSubmission,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    new_result = LifeWheelResult(
        user_id=user.id,
        scores=json.dumps(submission.scores)
    )
    db.add(new_result)
    db.commit()
    return {"message": "🎯 Колесо жизни сохранено!"}
