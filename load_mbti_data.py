
import json
import os
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.mbti import MBTIQuestion, MBTIResult

def load_mbti_data():
    db: Session = SessionLocal()

    # Путь к файлам
    base_path = os.path.join("app", "data")

    # Загружаем вопросы MBTI
    with open(os.path.join(base_path, "mbti_questions.json"), "r", encoding="utf-8") as f:
        questions = json.load(f)
        for q in questions:
            mbti_q = MBTIQuestion(
                question_a=q["question_a"],
                question_b=q["question_b"],
                dimension=q["dimension"],
                trait_a=q["trait_a"],
                trait_b=q["trait_b"],
                position=q["position"]
            )
            db.add(mbti_q)

    # Загружаем результаты MBTI
    with open(os.path.join(base_path, "mbti_results.json"), "r", encoding="utf-8") as f:
        results = json.load(f)
        for r in results:
            mbti_r = MBTIResult(
                type_code=r["type_code"],
                description=r["description"]
            )
            db.add(mbti_r)

    db.commit()
    db.close()
    print("✅ Данные MBTI успешно загружены в базу.")

if __name__ == "__main__":
    load_mbti_data()
