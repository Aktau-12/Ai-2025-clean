from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from app.database.db import SessionLocal, get_db
from app.models.hero import UserHeroStep, UserHeroProgress
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.test import UserResult
from pydantic import BaseModel
import json
import os

router = APIRouter(tags=["Hero"])

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
HERO_STEPS_PATH = os.path.join(BASE_DIR, "data", "hero_steps.json")
PROFESSIONS_PATH = os.path.join(BASE_DIR, "data", "professions.json")

with open(HERO_STEPS_PATH, "r", encoding="utf-8") as f:
    ALL_STEPS = json.load(f)

with open(PROFESSIONS_PATH, "r", encoding="utf-8") as f:
    ALL_PROFESSIONS = json.load(f)

def get_points_for_step(step_id: str) -> int:
    for stage in ALL_STEPS:
        for step in stage["steps"]:
            if step["id"] == step_id:
                return step.get("points", 0)
    return 0

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class StepUpdate(BaseModel):
    step_id: str
    completed: bool

@router.get("/progress")
def get_hero_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(UserHeroStep).filter(UserHeroStep.user_id == user.id, UserHeroStep.completed == True).all()
    return [p.step_id for p in progress]

@router.post("/progress")
def update_hero_progress(data: StepUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(UserHeroStep).filter(UserHeroStep.user_id == user.id, UserHeroStep.step_id == data.step_id).first()
    already_completed = progress.completed if progress else False

    if progress:
        progress.completed = data.completed
        progress.timestamp = datetime.utcnow()
    else:
        progress = UserHeroStep(
            user_id=user.id,
            step_id=data.step_id,
            completed=data.completed,
            timestamp=datetime.utcnow()
        )
        db.add(progress)

    points = 0
    if data.completed and not already_completed:
        points = get_points_for_step(data.step_id)
        user_progress = db.query(UserHeroProgress).filter_by(user_id=user.id).first()
        if not user_progress:
            user_progress = UserHeroProgress(user_id=user.id, xp=0)
            db.add(user_progress)
        user_progress.xp += points

    db.commit()
    return {"message": f"Шаг {data.step_id} обновлён! ✅ XP начислено: {points}"}

@router.get("/full")
def get_full_hero_path(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    passed_tests = db.execute(
        text("""
        SELECT test_id FROM user_results
        WHERE user_id = :user_id
        GROUP BY test_id
        HAVING COUNT(*) > 0
        """),
        {"user_id": user.id}
    ).fetchall()
    passed_test_ids = {row[0] for row in passed_tests}

    required_test_ids = {1, 2, 3}
    if required_test_ids.issubset(passed_test_ids):
        existing = db.query(UserHeroStep).filter_by(user_id=user.id, step_id="complete_tests").first()
        if not existing:
            db.add(UserHeroStep(
                user_id=user.id,
                step_id="complete_tests",
                completed=True,
                timestamp=datetime.utcnow()
            ))
            points = get_points_for_step("complete_tests")
            user_progress = db.query(UserHeroProgress).filter_by(user_id=user.id).first()
            if not user_progress:
                user_progress = UserHeroProgress(user_id=user.id, xp=0)
                db.add(user_progress)
            user_progress.xp += points
            db.commit()

    user_progress = db.query(UserHeroStep).filter(UserHeroStep.user_id == user.id).all()
    completed_ids = {p.step_id for p in user_progress if p.completed}

    enriched_steps = []
    for stage in ALL_STEPS:
        enriched_stage = {
            "stage": stage["stage"],
            "title": stage["title"],
            "description": stage.get("description", ""),
            "steps": []
        }
        for step in stage["steps"]:
            enriched_step = step.copy()
            enriched_step["completed"] = step["id"] in completed_ids
            enriched_stage["steps"].append(enriched_step)
        enriched_steps.append(enriched_stage)

    return {"stages": enriched_steps}

# ✅ Исправленная версия /professions
@router.get("/professions")
def get_professions_by_full_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    mbti_type = user.mbti_type
    archetype = user.archetype
    coretalents = []
    bigfive = {}

    results = db.query(UserResult).filter(UserResult.user_id == user.id).all()
    for res in results:
        try:
            data = json.loads(res.answers)
            if res.test_id == 1:
                if isinstance(data, dict):
                    top_coretalents = sorted(data.items(), key=lambda x: x[1], reverse=True)[:5]
                    coretalents = [str(talent_id) for talent_id, _ in top_coretalents]
            elif res.test_id == 2:
                if isinstance(data, dict):
                    bigfive = data
        except Exception as e:
            print(f"Ошибка парсинга ответа теста {res.test_id}:", e)

    if not archetype and not mbti_type and not coretalents:
        raise HTTPException(status_code=400, detail="Недостаточно данных для подбора профессий")

    def match_professions(user_profile, professions, limit=5):
        def score(prof):
            s = 0
            if user_profile["archetype"] and user_profile["archetype"] in prof.get("archetypes", []):
                s += 3
            if user_profile["mbti_type"] and user_profile["mbti_type"] in prof.get("mbti", []):
                s += 2
            if user_profile["coretalents"]:
                common = set(prof.get("coretalents", [])) & set(user_profile["coretalents"])
                s += len(common)
            if user_profile["bigfive"]:
                for trait, value in prof.get("bigfive", {}).items():
                    if user_profile["bigfive"].get(trait) == value:
                        s += 1
            return s

        return sorted(professions, key=score, reverse=True)[:limit]

    profile = {
        "mbti_type": mbti_type,
        "archetype": archetype,
        "coretalents": coretalents,
        "bigfive": bigfive
    }

    return match_professions(profile, ALL_PROFESSIONS, limit=5)
