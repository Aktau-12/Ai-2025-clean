from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.models.hero import UserHeroProgress
from app.schemas.rating import RatingUser
from app.routes.auth import get_current_user

router = APIRouter(prefix="/rating", tags=["Rating"])

@router.get("/", response_model=list[RatingUser])
def get_top_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        results = (
            db.query(User.id, User.name, UserHeroProgress.xp)
            .join(UserHeroProgress, User.id == UserHeroProgress.user_id)
            .order_by(UserHeroProgress.xp.desc())
            .limit(10)
            .all()
        )
        return [
            {"user_id": uid, "username": name or "Аноним", "xp": xp or 0}
            for uid, name, xp in results
        ]
    except Exception:
        raise HTTPException(status_code=500, detail="Ошибка сервера при получении рейтинга")
