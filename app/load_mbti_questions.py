import json
import os
from app.database.db import SessionLocal
from app.models.mbti import MBTIQuestion

def load_questions():
    file_path = os.path.join(os.path.dirname(__file__), "data", "mbti_questions.json")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()

    db.query(MBTIQuestion).delete()

    for item in data:
        question = MBTIQuestion(
            question_a=item["question_a"],
            question_b=item["question_b"],
            dimension=item["dimension"],
            trait_a=item["trait_a"],
            trait_b=item["trait_b"],
            position=item["position"]
        )
        db.add(question)

    db.commit()
    db.close()
    print(f"✅ Загружено {len(data)} MBTI вопросов.")

if __name__ == "__main__":
    load_questions()
