import json
from sqlalchemy.orm import Session
from app.database.db import SessionLocal  # ✅ Правильный импорт
from app.models.test import Test, Question  # ✅ Правильный импорт

# 🔧 Путь к файлу с вопросами
import os
file_path = os.path.join(os.path.dirname(__file__), "data", "coretalents_questions_fixed.json")

# 🔄 Создаем сессию
db: Session = SessionLocal()

# ✅ Проверяем, что тест с id = 1 (CoreTalents 34) существует
test = db.query(Test).filter(Test.id == 1).first()
if not test:
    raise Exception("❌ Тест с id=1 (CoreTalents 34) не найден в базе!")

# 🧹 Удаляем старые вопросы только для этого теста
print("🧹 Удаляю старые вопросы для теста 'CoreTalents 34'...")
db.query(Question).filter(Question.test_id == 1).delete()
db.commit()
print("✅ Старые вопросы удалены.")

# 📥 Загружаем JSON-файл
try:
    with open(file_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
except Exception as e:
    raise Exception(f"❌ Ошибка чтения файла {file_path}: {e}")

# ➕ Добавляем новые вопросы
added_count = 0
for i, q in enumerate(questions, start=1):
    if "question_a" in q and "question_b" in q:
        question_text = q["question_a"] + " / " + q["question_b"]
        question = Question(
            id=i,               # 👈 вручную присваиваем ID (если автоинкремент не используется)
            test_id=1,
            text=question_text
        )
        db.add(question)
        added_count += 1
    else:
        print(f"⚠️ Пропущен вопрос из-за отсутствия полей: {q}")

db.commit()
db.close()
print(f"✅ Загружено {added_count} вопросов для 'CoreTalents 34'.")
