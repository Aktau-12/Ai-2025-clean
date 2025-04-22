import sys
import os

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Добавляем корень проекта в sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.db import SessionLocal
from app.models.test import Test, Question

def add_or_update_gallup_test(db: Session):
    test = db.query(Test).filter(Test.name == "Gallup StrengthsFinder").first()

    if not test:
        # Создаем новый тест
        test = Test(name="Gallup StrengthsFinder", description="Определяет 34 сильные стороны личности.")
        db.add(test)
        db.commit()
        db.refresh(test)
        print("✅ Добавлен тест Gallup StrengthsFinder (временное имя)")
    else:
        print(f"ℹ️ Тест уже существует: id={test.id}")

    # Проверим есть ли вопросы
    if not test.questions:
        questions = [
            "Мне нравится учиться новому.",
            "Я всегда держу обещания.",
            "Я легко нахожу общий язык с людьми.",
            "Мне важно, чтобы другие чувствовали себя комфортно в моем окружении.",
            "Я всегда стремлюсь к достижению своих целей.",
            "Мне нравится анализировать проблемы и находить решения.",
            "Я люблю выстраивать долгосрочные стратегии.",
            "Мне нравится работать в команде.",
            "Я хорошо мотивирую других.",
            "Я всегда стараюсь улучшать себя и окружающий мир."
        ]
        for text in questions:
            db.add(Question(test_id=test.id, text=text))
        db.commit()
        print("✅ Вопросы успешно добавлены!")
    else:
        print("ℹ️ Вопросы уже существуют — пропущено")

    # Обновим название теста
    if test.name != "CoreTalents 34":
        test.name = "CoreTalents 34"
        db.commit()
        print("✅ Название теста обновлено на CoreTalents 34")
    else:
        print("ℹ️ Название теста уже корректное")

if __name__ == "__main__":
    db = SessionLocal()
    add_or_update_gallup_test(db)
    db.close()
