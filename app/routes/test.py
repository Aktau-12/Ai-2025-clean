from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.user import User
from app.routes.auth import get_current_user
from app.models.test import UserResult, Question
from app.models.coretalents import CoreQuestion
from app.models.mbti import MBTIResult, MBTIAnswer
from app.models.hero import UserHeroProgress
from pydantic import BaseModel
from datetime import datetime
import json
from pathlib import Path

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def add_xp(user_id: int, db: Session, amount: int = 20):
    progress = db.query(UserHeroProgress).filter(UserHeroProgress.user_id == user_id).first()
    if progress:
        progress.xp = (progress.xp or 0) + amount
    else:
        progress = UserHeroProgress(user_id=user.id, xp=amount)
        db.add(progress)
    db.commit()

def safe_parse_json(data):
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return {}
    return data if isinstance(data, dict) else {}

# 🧠 Простая логика архетипа
def determine_archetype(mbti_type: str, top_talents: list[int]) -> str:
    if mbti_type.startswith("E") and 1 in top_talents:
        return "Лидер"
    elif mbti_type.startswith("I") and 5 in top_talents:
        return "Аналитик"
    return "Создатель"

# Загрузка маппинга талантов
mapping = {}
mapping_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_question_mapping.json"
if mapping_path.exists():
    try:
        raw_map = json.loads(mapping_path.read_text(encoding="utf-8"))
        mapping = {int(item.get("question_id")): int(item.get("talent_id")) for item in raw_map}
    except Exception:
        mapping = {}

coretalents_data = {}
coretalents_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_results_data_full.json"
if coretalents_path.exists():
    try:
        raw = json.loads(coretalents_path.read_text(encoding="utf-8"))
        coretalents_data = {str(item["id"]): item for item in raw} if isinstance(raw, list) else raw
    except Exception:
        coretalents_data = {}

class CoreTalentsSubmission(BaseModel):
    answers: dict[int, int]

class BigFiveSubmission(BaseModel):
    answers: list[dict]
    result: dict

@router.get("/coretalents")
def get_coretalents_questions(db: Session = Depends(get_db)):
    questions = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
    return [{"id": q.id, "question_a": q.question_a, "question_b": q.question_b, "position": q.position} for q in questions]

@router.get("/{test_id}/questions")
def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    if test_id == 1:
        return get_coretalents_questions(db)
    if test_id == 2:
        qs = db.query(Question).filter(Question.test_id == 2).order_by(Question.position).all()
        return [{"id": q.id, "text": q.text, "position": q.position} for q in qs]
    raise HTTPException(status_code=404, detail="Вопросы не найдены")

@router.post("/1/submit")
def submit_coretalents(submission: CoreTalentsSubmission, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scores = {i: 0 for i in range(1, 35)}
    for q_id, ans in submission.answers.items():
        try:
            q_id = int(q_id)
            ans = int(ans)
        except:
            continue
        talent_id = mapping.get(q_id)
        if talent_id:
            scores[talent_id] += ans

    res = UserResult(
        user_id=user.id,
        test_id=1,
        answers=submission.answers,
        score=scores,
        timestamp=datetime.utcnow()
    )
    db.add(res)
    db.commit()
    add_xp(user.id, db, amount=50)
    return {"message": "CoreTalents submitted successfully", "result_id": res.id}

@router.post("/{test_id}/submit")
def submit_test_answers(test_id: int, submission: BigFiveSubmission, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = UserResult(
        user_id=user.id,
        test_id=test_id,
        answers=submission.result,
        score=None,
        timestamp=datetime.utcnow()
    )
    db.add(res)
    db.commit()

    if test_id == 2:
        add_xp(user.id, db, amount=30)
    elif test_id == 3:
        add_xp(user.id, db, amount=20)

    return {"message": f"Test {test_id} submitted!", "result_id": res.id}

@router.get("/1/results")
@router.get("/coretalents/results")
def get_coretalents_results(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.query(UserResult).filter(UserResult.user_id == user.id, UserResult.test_id == 1).order_by(UserResult.id.desc()).first()
    if not result:
        return {"answers": {}, "scores": {}}

    answers = safe_parse_json(result.answers)
    scores = safe_parse_json(result.score)

    return {"answers": answers, "scores": scores}

@router.get("/2/result")
def get_bigfive_result(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.query(UserResult).filter(UserResult.user_id == user.id, UserResult.test_id == 2).order_by(UserResult.id.desc()).first()
    if not result:
        raise HTTPException(status_code=404, detail="Результат не найден")
    parsed = safe_parse_json(result.answers)
    if isinstance(parsed, dict) and all(k in parsed for k in ["O", "C", "E", "A", "N"]):
        return parsed
    raise HTTPException(status_code=400, detail="Неверный формат результата")

@router.get("/my-results")
def get_my_results(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = []

    # CoreTalents
    core = db.query(UserResult).filter(UserResult.user_id == user.id, UserResult.test_id == 1).order_by(UserResult.timestamp.desc()).first()
    if core:
        scores = safe_parse_json(core.score)
        top_ids = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:5]
        names = [coretalents_data.get(str(tid), {}).get("name", f"Талант {tid}") for tid, _ in top_ids]
        summary_text = ", ".join(names)
        results.append({
            "test_name": "CoreTalents 34",
            "result_id": core.id,
            "answers_count": len(scores),
            "score": scores,
            "completed_at": core.timestamp.isoformat() if core.timestamp else None,
            "summary": f"Топ 5 талантов: {summary_text}"
        })

    # Big Five
    big = db.query(UserResult).filter(UserResult.user_id == user.id, UserResult.test_id == 2).order_by(UserResult.timestamp.desc()).first()
    if big:
        parsed_big = safe_parse_json(big.answers)
        traits = {
            "O": "Открытость опыту",
            "C": "Добросовестность",
            "E": "Экстраверсия",
            "A": "Доброжелательность",
            "N": "Нейротизм"
        }
        summary_parts = []
        for key in ["O", "C", "E", "A", "N"]:
            val = parsed_big.get(key)
            if val is not None:
                summary_parts.append(f"{traits[key]}: {val}")
        summary_str = "; ".join(summary_parts)

        results.append({
            "test_name": "Big Five",
            "result_id": big.id,
            "answers_count": len(parsed_big),
            "score": parsed_big,
            "completed_at": big.timestamp.isoformat() if big.timestamp else None,
            "summary": summary_str
        })

    # MBTI
    if user.mbti_type:
        count = db.query(MBTIAnswer).filter(MBTIAnswer.user_id == user.id).count()
        mbti_result = db.query(MBTIResult).filter(MBTIResult.type_code == user.mbti_type).first()
        summary = f"Тип: {user.mbti_type} — {mbti_result.description if mbti_result else ''}"
        results.append({
            "test_name": "MBTI",
            "result_id": f"MBTI-{user.id}",
            "answers_count": count,
            "score": user.mbti_type,
            "completed_at": datetime.utcnow().isoformat(),
            "summary": summary
        })

    # ✅ Автоматическое присвоение архетипа
    if user.mbti_type and core and isinstance(core.score, dict) and len(core.score) >= 5:
        top5 = sorted(core.score.items(), key=lambda x: x[1], reverse=True)[:5]
        top_talents = [int(tid) for tid, _ in top5]
        new_archetype = determine_archetype(user.mbti_type, top_talents)

        if user.archetype != new_archetype:
            user.archetype = new_archetype
            db.commit()

    return results
