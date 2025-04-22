import json
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.test import Question

# 📥 Загрузка вопросов из файла
def load_coretalents_questions():
    with open("data/coretalents_questions_fixed.json", encoding="utf-8") as f:
        return json.load(f)

def reload_questions():
    db: Session = SessionLocal()
    test_id = 1  # Тест "CoreTalents 34"

    try:
        print(f"🧹 Удаляю старые вопросы с test_id={test_id}...")
        db.query(Question).filter(Question.test_id == test_id).delete()
        db.commit()
        print("✅ Старые вопросы удалены.")

        questions_data = load_coretalents_questions()
        count = 0

        for q in questions_data:
            if "text" in q:
                text = q["text"]
            elif "question_a" in q and "question_b" in q:
                text = f"{q['question_a']} / {q['question_b']}"
            else:
                print(f"⚠️ Пропущен вопрос (нет текста): {q}")
                continue

            question = Question(test_id=test_id, text=text)
            db.add(question)
            count += 1

        db.commit()
        print(f"✅ Загружено {count} вопросов для теста с id={test_id}.")
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при загрузке вопросов: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reload_questions()
