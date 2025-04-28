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

# Dependency: получаем сессию БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Добавление XP пользователю
def add_xp(user_id: int, db: Session, amount: int = 20):
    progress = db.query(UserHeroProgress).filter(UserHeroProgress.user_id == user_id).first()
    if progress:
        progress.xp = (progress.xp or 0) + amount
    else:
        progress = UserHeroProgress(user_id=user_id, xp=amount, step_id="init")
        db.add(progress)
    db.commit()

# Загрузка mapping вопросов -> талантов
mapping = {}
mapping_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_question_mapping.json"
if mapping_path.exists():
    try:
        raw_map = json.loads(mapping_path.read_text(encoding="utf-8"))
        mapping = {int(item.get("question_id")): int(item.get("talent_id")) for item in raw_map}
    except Exception:
        mapping = {}

# ---- Tests listing ----
@router.get("/")
def get_tests(db: Session = Depends(get_db)):
    return []

# ---- CoreTalents questions ----
@router.get("/coretalents")
def get_coretalents_questions(db: Session = Depends(get_db)):
    questions = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
    return [
        {"id": q.id, "question_a": q.question_a, "question_b": q.question_b, "position": q.position}
        for q in questions
    ]

# ---- CoreTalents results ----
@router.get("/1/results")
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

    # Функция для надёжного парсинга JSON полей
    def parse_field(value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as err:
                raise HTTPException(status_code=500, detail=f"Ошибка разбора JSON: {err.msg}")
        if isinstance(value, (dict, list)):
            return value
        raise HTTPException(status_code=500, detail=f"Неподдерживаемый формат данных: {type(value)}")

    answers = parse_field(result.answers)
    scores = parse_field(result.score)

    return {"answers": answers, "scores": scores}

# ---- Aggregated 'my-results' endpoint ----
coretalents_data = {}
coretalents_path = Path(__file__).resolve().parent.parent / "data" / "coretalents_results_data_full.json"
if coretalents_path.exists():
    raw = json.loads(coretalents_path.read_text(encoding="utf-8"))
    coretalents_data = {str(item["id"]): item for item in raw} if isinstance(raw, list) else raw

@router.get("/my-results")
def get_my_results(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = []

    # CoreTalents summary
    core = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 1)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if core:
        answers = json.loads(core.answers) if isinstance(core.answers, str) else core.answers
        top_ids = sorted(answers.items(), key=lambda x: x[1], reverse=True)[:5]
        names = [coretalents_data.get(str(tid), {}).get("name", f"Талант {tid}") for tid, _ in top_ids]
        summary_text = ", ".join(names)
        results.append({
            "test_name": "CoreTalents 34",
            "result_id": core.id,
            "answers_count": len(answers),
            "score": core.score,
            "completed_at": core.timestamp.isoformat() if core.timestamp else None,
            "summary": f"Топ 5 талантов: {summary_text}"
        })

    # Big Five summary
    big = (
        db.query(UserResult)
        .filter(UserResult.user_id == user.id, UserResult.test_id == 2)
        .order_by(UserResult.timestamp.desc())
        .first()
    )
    if big:
        parsed_big = json.loads(big.answers) if isinstance(big.answers, str) else big.answers
        scores_str = f"O: {parsed_big.get('O')}, C: {parsed_big.get('C')}, E: {parsed_big.get('E')}, A: {parsed_big.get('A')}, N: {parsed_big.get('N')}"
        descs = []
        descs.append("открыт к новому" if parsed_big.get("O", 0) >= 3 else "предпочитает стабильность")
        descs.append("организованный и надёжный" if parsed_big.get("C", 0) >= 3 else "гибкий и творческий")
        descs.append("энергичный и общительный" if parsed_big.get("E", 0) >= 3 else "спокойный и наблюдательный")
        descs.append("доброжелательный и вежливый" if parsed_big.get("A", 0) >= 3 else "прямой и критичный")
        descs.append("эмоционально чувствительный" if parsed_big.get("N", 0) >= 3 else "уравновешенный и стрессоустойчивый")
        full_desc = f"{scores_str}\nТы — {', '.join(descs)} человек."
        results.append({
            "test_name": "Big Five",
            "result_id": big.id,
            "answers_count": len(parsed_big),
            "score": big.score,
            "completed_at": big.timestamp.isoformat() if big.timestamp else None,
            "summary": full_desc
        })

    # MBTI summary
    if user.mbti_type:
        count = db.query(MBTIAnswer).filter(MBTIAnswer.user_id == user.id).count()
        mbti_result = db.query(MBTIResult).filter(MBTIResult.type_code == user.mbti_type).first()
        mbti_summary = f"Тип: {user.mbti_type}"
        if mbti_result and mbti_result.description:
            mbti_summary += f" — {mbti_result.description}"
        results.append({
            "test_name": "MBTI",
            "result_id": f"MBTI-{user.id}",
            "answers_count": count,
            "score": user.mbti_type,
            "completed_at": datetime.utcnow().isoformat(),
            "summary": mbti_summary
        })

    return results

# ---- Questions by test ID ----
@router.get("/{test_id}/questions")
def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    if test_id == 1:
        qs = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
        return [{"id": q.id, "question_a": q.question_a, "question_b": q.question_b, "position": q.position} for q in qs]
    if test_id == 2:
        qs = db.query(Question).filter(Question.test_id == 2).order_by(Question.position).all()
        return [{"id": q.id, "text": q.text, "position": q.position} for q in qs]
    raise HTTPException(status_code=404, detail="Вопросы для указанного теста не найдены")

# ---- Submission CoreTalents ----
class CoreTalentsSubmission(BaseModel):
    answers: dict[int, int]

@router.post("/1/submit")
def submit_coretalents(submission: CoreTalentsSubmission, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scores = {i: 0 for i in range(1, 35)}
    for q_id, ans in submission.answers.items():
        tal = mapping.get(q_id)
        if tal:
            scores[tal] += ans
    res = UserResult(user_id=user.id, test_id=1, answers=json.dumps(submission.answers), score=json.dumps(scores))
    db.add(res)
    db.commit()
    add_xp(user.id, db, amount=50)
    return {"message": "CoreTalents submitted successfully", "result_id": res.id}

# ---- Submission других тестов ----
class BigFiveSubmission(BaseModel):
    answers: list[dict]
    result: dict

@router.post("/{test_id}/submit")
def submit_test_answers(test_id: int, submission: BigFiveSubmission, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = UserResult(user_id=user.id, test_id=test_id, answers=json.dumps(submission.result), score=0)
    db.add(res)
    db.commit()
    if test_id == 2:
        add_xp(user.id, db, amount=30)
    elif test_id == 3:
        add_xp(user.id, db, amount=20)
    return {"message": f"Test {test_id} submitted!", "result_id": res.id}

# ---- Получение результата Big Five ----
@router.get("/2/result")
def get_bigfive_result(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.query(UserResult).filter(UserResult.user_id == user.id, UserResult.test_id == 2).order_by(UserResult.id.desc()).first()
    if not result:
        raise HTTPException(status_code=404, detail="Результат не найден")
    parsed = json.loads(result.answers) if isinstance(result.answers, str) else result.answers
    if isinstance(parsed, dict) and all(k in parsed for k in ["O", "C", "E", "A", "N"]):
        return parsed
    raise HTTPException(status_code=400, detail="Неверный формат результата")
