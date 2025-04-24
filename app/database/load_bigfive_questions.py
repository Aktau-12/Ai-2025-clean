import json
import os
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.test import Test, Question

# 📍 Путь к файлу big_five_questions.json относительно текущего файла
FILE_PATH = os.path.join(os.path.dirname(__file__), "data", "big_five_questions.json")
TEST_NAME = "Big Five"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def main():
    db = next(get_db())

    # Получаем или создаём тест Big Five
    test = db.query(Test).filter(Test.name == TEST_NAME).first()
    if not test:
        test = Test(name=TEST_NAME, description="Оценка по 5 чертам личности (Big Five)")
        db.add(test)
        db.commit()
        db.refresh(test)
        print(f"🆕 Создан тест: {TEST_NAME} (ID: {test.id})")
    else:
        print(f"ℹ️ Тест '{TEST_NAME}' уже существует (ID: {test.id})")

    # Удаляем старые вопросы
    db.query(Question).filter(Question.test_id == test.id).delete()
    db.commit()
    print("🧹 Старые вопросы удалены")

    # Загружаем новые вопросы с text и position
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    added = 0
    for item in data:
        text = item.get("text")
        position = item.get("position")

        if text and position:
            q = Question(
                test_id=test.id,
                text=text,
                position=position
            )
            db.add(q)
            added += 1

    db.commit()
    print(f"✅ Загружено {added} вопросов для теста '{TEST_NAME}'")

if __name__ == "__main__":
    main()
