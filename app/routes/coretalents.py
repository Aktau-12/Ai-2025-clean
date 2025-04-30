from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.user import User
from app.routes.auth import get_current_user

from app.models.test import Test, Question, UserResult
from app.models.coretalents import CoreQuestion
import json
import os
from pydantic import BaseModel
from collections import Counter

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_tests(db: Session = Depends(get_db)):
    return db.query(Test).all()

@router.get("/gallup")
def get_gallup_test(db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.name == "Gallup StrengthsFinder").first()
    if not test:
        raise HTTPException(status_code=404, detail="Gallup test not found")
    return {"test_id": test.id, "questions": [q.text for q in test.questions]}

@router.post("/gallup/submit")
def submit_gallup_test(answers: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.name == "Gallup StrengthsFinder").first()
    if not test:
        raise HTTPException(status_code=404, detail="Gallup test not found")

    result = UserResult(user_id=user.id, test_id=test.id, answers=str(answers), score=0)
    db.add(result)
    db.commit()
    
    return {"message": "Gallup test submitted!", "result_id": result.id}

@router.get("/coretalents")
def get_coretalents_questions(db: Session = Depends(get_db)):
    questions = db.query(CoreQuestion).order_by(CoreQuestion.position).all()
    return [
        {
            "id": str(q.id),
            "question_a": q.question_a,
            "question_b": q.question_b,
            "position": q.position
        }
        for q in questions
    ]

@router.post("/coretalents/submit")
def submit_coretalents_test(
    answers: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.name.ilike("%CoreTalents%")).first()
    if not test:
        raise HTTPException(status_code=404, detail="CoreTalents test not found")

    # Считаем баллы по талантам
    scores = Counter()
    for k, v in answers.items():
        scores[int(k)] += v

    top_5_ids = [tid for tid, _ in scores.most_common(5)]

    # Загружаем данные талантов
    data_path = os.path.join("app", "data", "coretalents_results_data_full.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            talents_data = json.load(f)
            id_to_name = {t["id"]: t["name"] for t in talents_data}
    except Exception as e:
        print(f"❌ Ошибка загрузки данных: {e}")
        id_to_name = {}

    top_5_names = [id_to_name.get(tid, f"Талант {tid}") for tid in top_5_ids]
    summary_text = "Топ 5 талантов: " + ", ".join(top_5_names)

    result = UserResult(
        user_id=user.id,
        test_id=test.id,
        answers=json.dumps(answers),
        score=json.dumps(dict(scores)),
        summary=summary_text
    )

    db.add(result)
    db.commit()

    return {"message": "CoreTalents test submitted!", "result_id": result.id}

class TalentInput(BaseModel):
    id: int
    score: int

@router.post("/coretalents/results")
def get_coretalents_results(top_talents: list[TalentInput]):
    data_path = os.path.join("app", "data", "coretalents_results_data_full.json")

    with open(data_path, "r", encoding="utf-8") as f:
        talents_raw = json.load(f)
        talent_dict = {t["id"]: t for t in talents_raw}

    result = []
    for i, item in enumerate(top_talents, 1):
        talent = talent_dict.get(item.id)
        if talent:
            result.append({
                "rank": i,
                "id": item.id,
                "name": talent["name"],
                "score": item.score,
                "description": talent["description"],
                "details": talent["details"]
            })
        else:
            result.append({
                "rank": i,
                "id": item.id,
                "name": f"Талант {item.id}",
                "score": item.score,
                "description": "Описание отсутствует",
                "details": ""
            })

    return {"results": result}
