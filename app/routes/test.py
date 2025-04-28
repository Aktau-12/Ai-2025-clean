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
import ast
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
        progress = UserHeroProgress(user_id=user_id, xp=amount, step_id="init")
        db.add(progress)
    db.commit()

@router.get("/")
def get_tests(db: Session = Depends(get_db)):
    return []

@router.get("/coretalents")
def get_coretalents_questions(db: Session = Depends(get_db)):
    questions = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
    return [
        {
            "id": q.id,
            "question_a": q.question_a,
            "question_b": q.question_b,
            "position": q.position
        }
        for q in questions
    ]

@router.get("/coretalents/results")
def get_coretalents_results(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 1)
        .order_by(UserResult.id.desc())
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Результаты не найдены")

    try:
        parsed_answers = ast.literal_eval(result.answers)
        scores = ast.literal_eval(result.score)  # Загружаем баллы
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка разбора данных: {e}")

    # Возвращаем ответ с баллами
    return {
        "answers": parsed_answers,
        "scores": scores
    }

# Загрузка coretalents_results_data_full.json
coretalents_data = {}
coretalents_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_results_data_full.json"
if coretalents_path.exists():
    raw = json.loads(coretalents_path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        coretalents_data = {str(item["id"]): item for item in raw}
    else:
        coretalents_data = raw

@router.get("/my-results")
def get_my_results(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = []

    # CoreTalents
    core = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 1)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if core:
        parsed = ast.literal_eval(core.answers)
        top_traits = sorted(parsed.items(), key=lambda x: x[1], reverse=True)[:5]
        summary_list = []
        for trait_id, _ in top_traits:
            entry = coretalents_data.get(str(trait_id), {})
            name = entry.get("name") or entry.get("title") or f"Талант {trait_id}"
            summary_list.append(name)
        summary_text = ", ".join(summary_list)

        results.append({
            "test_name": "CoreTalents 34",
            "result_id": core.id,
            "answers_count": len(parsed),
            "score": core.score,
            "completed_at": core.timestamp.isoformat() if core.timestamp else None,
            "summary": f"Топ 5 талантов: {summary_text}"
        })

    # Big Five
    bigfive = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 2)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if bigfive:
        parsed = ast.literal_eval(bigfive.answers)
        summary_scores = f"O: {parsed.get('O')}, C: {parsed.get('C')}, E: {parsed.get('E')}, A: {parsed.get('A')}, N: {parsed.get('N')}"
        description_parts = []
        description_parts.append("открыт к новому" if parsed.get("O", 0) >= 3 else "предпочитает стабильность")
        description_parts.append("организованный и надёжный" if parsed.get("C", 0) >= 3 else "гибкий и творческий")
        description_parts.append("энергичный и общительный" if parsed.get("E", 0) >= 3 else "спокойный и наблюдательный")
        description_parts.append("доброжелательный и вежливый" if parsed.get("A", 0) >= 3 else "прямой и критичный")
        description_parts.append("эмоционально чувствительный" if parsed.get("N", 0) >= 3 else "уравновешенный и стрессоустойчивый")
        summary_full = f"{summary_scores}\nТы — {', '.join(description_parts)} человек."

        results.append({
            "test_name": "Big Five",
            "result_id": bigfive.id,
            "answers_count": len(parsed),
            "score": bigfive.score,
            "completed_at": bigfive.timestamp.isoformat() if bigfive.timestamp else None,
            "summary": summary_full
        })

    # MBTI
    if user.mbti_type:
        mbti_count = db.query(MBTIAnswer).filter(MBTIAnswer.user_id == user.id).count()
        mbti_result = db.query(MBTIResult).filter(MBTIResult.type_code == user.mbti_type).first()
        summary = f"Тип: {user.mbti_type}"
        if mbti_result and mbti_result.description:
            summary += f" — {mbti_result.description}"
        results.append({
            "test_name": "MBTI",
            "result_id": f"MBTI-{user.id}",
            "answers_count": mbti_count,
            "score": user.mbti_type,
            "completed_at": datetime.utcnow().isoformat(),
            "summary": summary
        })

    return results

@router.get("/{test_id}/questions")
def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    if test_id == 1:
        questions = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
        return [
            {"id": q.id, "question_a": q.question_a, "question_b": q.question_b, "position": q.position}
            for q in questions
        ]
    elif test_id == 2:
        questions = db.query(Question).filter(Question.test_id == 2).order_by(Question.position).all()
        return [
            {"id": q.id, "text": q.text, "position": q.position}
            for q in questions
        ]
    else:
        raise HTTPException(status_code=404, detail="Вопросы для указанного теста не найдены")

class CoreTalentsSubmission(BaseModel):
    answers: dict[int, int]

@router.post("/1/submit")
def submit_coretalents(submission: CoreTalentsSubmission,
                       user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    # Подсчёт баллов для каждого таланта
    scores = {talent_id: 0 for talent_id in range(1, 35)}  # Инициализация баллов для 34 талантов
    for question_id, answer in submission.answers.items():
        talent_id = mapping.get(question_id)
        if talent_id:
            scores[talent_id] += answer

    # Сохранение результатов
    result = UserResult(user_id=user.id, test_id=1, answers=json.dumps(submission.answers), score=json.dumps(scores))
    db.add(result)
    db.commit()

    # Добавление XP пользователю
    add_xp(user.id, db, amount=50)

    return {"message": "CoreTalents submitted successfully", "result_id": result.id}

class BigFiveSubmission(BaseModel):
    answers: list[dict]
    result: dict

@router.post("/{test_id}/submit")
def submit_test_answers(test_id: int,
                        submission: BigFiveSubmission,
                        user: User = Depends(get_current_user),
                        db: Session = Depends(get_db)):
    result = UserResult(user_id=user.id, test_id=test_id, answers=json.dumps(submission.result), score=0)
    db.add(result)
    db.commit()
    if test_id == 2:
        add_xp(user.id, db, amount=30)
    elif test_id == 3:
        add_xp(user.id, db, amount=20)
    return {"message": f"Test {test_id} submitted!", "result_id": result.id}

@router.get("/2/result")
def get_bigfive_result(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 2)
        .order_by(UserResult.id.desc())
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Результат не найден")
    try:
        parsed = ast.literal_eval(result.answers)
        if isinstance(parsed, dict) and all(k in parsed for k in ["O", "C", "E", "A", "N"]):
            return parsed
        else:
            raise HTTPException(status_code=400, detail="Неверный формат результата")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка разбора: {e}")
