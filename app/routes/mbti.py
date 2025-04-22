print("✅ mbti.py импортирован!")  # Лог для диагностики
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.db import get_db
from app.models.mbti import MBTIQuestion, MBTIResult
from app.models.user import User
from app.models.test import Test, UserResult
from app.schemas.mbti import MBTIAnswerSchema, MBTIResultSchema
from app.routes.auth import get_current_user

router = APIRouter(tags=["MBTI"])

# 🔹 Получение всех вопросов MBTI
@router.get("/questions", response_model=list[dict])
def get_mbti_questions(db: Session = Depends(get_db)):
    questions = db.query(MBTIQuestion).order_by(MBTIQuestion.position).all()
    return [
        {
            "id": q.id,
            "question_a": q.question_a,
            "question_b": q.question_b,
            "dimension": q.dimension,
            "trait_a": q.trait_a,
            "trait_b": q.trait_b,
            "position": q.position,
        }
        for q in questions
    ]

# 🔹 Получение описания по типу MBTI
@router.get("/result/{mbti_type}", response_model=MBTIResultSchema)
def get_mbti_result(mbti_type: str, db: Session = Depends(get_db)):
    result = db.query(MBTIResult).filter(MBTIResult.type_code == mbti_type.upper()).first()
    if not result:
        raise HTTPException(status_code=404, detail="Тип MBTI не найден")
    return result

# 🔹 Получение результата текущего пользователя
@router.get("/me/result", response_model=MBTIResultSchema)
def get_user_mbti_result(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.mbti_type:
        raise HTTPException(status_code=404, detail="Пользователь не проходил MBTI")

    result = db.query(MBTIResult).filter(MBTIResult.type_code == current_user.mbti_type).first()
    if not result:
        raise HTTPException(status_code=404, detail="Результат не найден")

    return result

# 🔹 Обработка и сохранение результата
@router.post("/submit", response_model=dict)
def submit_mbti_test(
    answers: MBTIAnswerSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    traits = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
    raw_answers = []

    for item in answers.answers:
        answer = item.answer.upper()
        raw_answers.append({
            "question_id": item.question_id,
            "answer": answer,
            "trait_a": item.trait_a,
            "trait_b": item.trait_b
        })

        if answer == item.trait_a:
            traits[item.trait_a] += 1
        elif answer == item.trait_b:
            traits[item.trait_b] += 1
        elif answer == item.trait_a + item.trait_b:
            traits[item.trait_a] += 0.5
            traits[item.trait_b] += 0.5
        # ❌ вариант (ни один) — не влияет

    mbti_type = "".join([
        "E" if traits["E"] >= traits["I"] else "I",
        "S" if traits["S"] >= traits["N"] else "N",
        "T" if traits["T"] >= traits["F"] else "F",
        "J" if traits["J"] >= traits["P"] else "P"
    ])

    db.query(User).filter(User.id == current_user.id).update({"mbti_type": mbti_type})

    test = db.query(Test).filter(Test.name == "MBTI").first()
    if test:
        result_entry = UserResult(
            user_id=current_user.id,
            test_id=test.id,
            answers=str({"answers": raw_answers, "type": mbti_type}),
            score=0
        )
        db.add(result_entry)

    db.commit()

    result = db.query(MBTIResult).filter(MBTIResult.type_code == mbti_type).first()
    if not result:
        raise HTTPException(status_code=404, detail="Результат по типу не найден")

    return {
        "type": mbti_type,
        "description": result.description,
        "details": traits
    }
