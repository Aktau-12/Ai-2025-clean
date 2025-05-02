from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pathlib import Path
import json
from typing import Dict, List, Any

from app.database.db import SessionLocal
from app.models.user import User
from app.models.test import UserResult, Question
from app.models.coretalents import CoreQuestion
from app.models.mbti import MBTIResult, MBTIAnswer
from app.models.hero import UserHeroProgress
from app.routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(tags=["Tests"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def add_xp(user_id: int, db: Session, amount: int = 20):
    prog = db.query(UserHeroProgress).filter(UserHeroProgress.user_id == user_id).first()
    if prog:
        prog.xp = (prog.xp or 0) + amount
    else:
        prog = UserHeroProgress(user_id=user_id, xp=amount)
        db.add(prog)
    db.commit()

def safe_parse_json(data: Any) -> Any:
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return {}
    return data

# 🔍 Маппинг CoreTalents
mapping: Dict[int, int] = {}
_map_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_question_mapping.json"
if _map_path.exists():
    raw = json.loads(_map_path.read_text(encoding="utf-8"))
    mapping = {int(item["question_id"]): int(item["talent_id"]) for item in raw}

# 📊 Данные по талантам
coretalents_data: Dict[str, Any] = {}
_data_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_results_data_full.json"
if _data_path.exists():
    raw = json.loads(_data_path.read_text(encoding="utf-8"))
    coretalents_data = {str(item["id"]): item for item in raw}

# 📊 Данные по Big Five
bigfive_data: Dict[str, Any] = {}
_bigfive_path = Path(__file__).resolve().parent.parent / "data" / "bigfive_results.json"
if _bigfive_path.exists():
    raw = json.loads(_bigfive_path.read_text(encoding="utf-8"))
    bigfive_data = {item["trait"]: item for item in raw}

# ─── Pydantic ─────────────────────────────────────────────────────────────
class CoreTalentsSubmission(BaseModel):
    answers: Dict[int, int]

class BigFiveSubmission(BaseModel):
    answers: List[Dict[str, Any]]
    result: Dict[str, Any]

# ─── Вопросы ──────────────────────────────────────────────────────────────
@router.get("/{test_id}/questions", status_code=status.HTTP_200_OK)
def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    if test_id == 1:
        qs = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
        return [
            {"id": q.id, "question_a": q.question_a, "question_b": q.question_b, "position": q.position}
            for q in qs
        ]
    if test_id == 2:
        qs = db.query(Question).filter(Question.test_id == 2).order_by(Question.position).all()
        return [{"id": q.id, "text": q.text, "position": q.position} for q in qs]
    raise HTTPException(status_code=404, detail="Вопросы не найдены")

# ─── Отправка CoreTalents ─────────────────────────────────────────────────
@router.post("/1/submit", status_code=status.HTTP_201_CREATED)
def submit_coretalents(
    submission: CoreTalentsSubmission,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores = {tid: 0 for tid in range(1, 35)}
    for q_id, val in submission.answers.items():
        tid = mapping.get(q_id)
        if tid is not None:
            scores[tid] += int(val)

    res = UserResult(
        user_id=user.id,
        test_id=1,
        answers=submission.answers,
        score=scores,
        timestamp=datetime.utcnow(),
    )
    db.add(res)
    db.commit()

    add_xp(user.id, db, amount=50)
    return {"message": "CoreTalents submitted", "result_id": res.id}

# ─── Отправка прочих тестов ───────────────────────────────────────────────
@router.post("/{test_id}/submit", status_code=status.HTTP_201_CREATED)
def submit_other(
    test_id: int,
    submission: BigFiveSubmission,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    res = UserResult(
        user_id=user.id,
        test_id=test_id,
        answers=submission.result,
        score=None,
        timestamp=datetime.utcnow(),
    )
    db.add(res)
    db.commit()

    if test_id == 2:
        add_xp(user.id, db, amount=30)
    if test_id == 3:
        add_xp(user.id, db, amount=20)

    return {"message": f"Test {test_id} submitted", "result_id": res.id}

# ─── Получение результата BigFive ──────────────────────────────────────────
@router.get("/2/result", status_code=status.HTTP_200_OK)
def get_bigfive_result(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 2)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Результат не найден")
    parsed = safe_parse_json(rec.answers)
    if not isinstance(parsed, dict) or not all(k in parsed for k in ["O", "C", "E", "A", "N"]):
        raise HTTPException(status_code=400, detail="Неверный формат результата")
    return parsed

# ─── CoreTalents результаты ───────────────────────────────────────────────
@router.get("/1/results", status_code=status.HTTP_200_OK)
def get_coretalents_results(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 1)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if not rec:
        return {"answers": {}, "scores": {}}
    return {
        "answers": safe_parse_json(rec.answers),
        "scores": safe_parse_json(rec.score),
    }

# ─── Моя история по всем тестам ────────────────────────────────────────────
@router.get("/my-results", status_code=status.HTTP_200_OK)
def get_my_results(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results: List[Dict[str, Any]] = []

    # CoreTalents
    core = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 1)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if core:
        scores = safe_parse_json(core.score)
        top5 = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:5]
        names = [coretalents_data.get(str(tid), {}).get("name", f"Talent {tid}") for tid, _ in top5]
        results.append({
            "test_name": "CoreTalents 34",
            "result_id": core.id,
            "answers_count": len(scores),
            "score": scores,
            "completed_at": core.timestamp.isoformat(),
            "summary": " / ".join(names),
        })

    # Big Five
    big = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 2)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if big:
        parsed = safe_parse_json(big.answers)
        if isinstance(parsed, dict):
            top_traits = sorted(parsed.items(), key=lambda x: x[1], reverse=True)[:5]
            top_names = []
            for trait_code, score in top_traits:
                trait_info = bigfive_data.get(trait_code.upper(), {})
                name = trait_info.get("name", trait_code)
                top_names.append(name)
            summary = " / ".join(top_names)
        else:
            summary = "Нет данных"
        results.append({
            "test_name": "Big Five",
            "result_id": big.id,
            "answers_count": len(parsed),
            "score": parsed,
            "completed_at": big.timestamp.isoformat(),
            "summary": summary,
        })

    # MBTI
    if user.mbti_type:
        cnt = db.query(MBTIAnswer).filter(MBTIAnswer.user_id == user.id).count()
        mb = db.query(MBTIResult).filter(MBTIResult.type_code == user.mbti_type).first()
        desc = mb.description if mb else ""
        results.append({
            "test_name": "MBTI",
            "result_id": f"MBTI-{user.id}",
            "answers_count": cnt,
            "score": user.mbti_type,
            "completed_at": datetime.utcnow().isoformat(),
            "summary": f"{user.mbti_type} — {desc}",
        })

    return results
