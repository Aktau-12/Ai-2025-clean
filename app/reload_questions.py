import json
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.coretalents import CoreQuestion  # ✅ Модель core_questions

# 🔧 Путь к JSON-файлу
import os
file_path = os.path.join(os.path.dirname(__file__), "data", "coretalents_questions_fixed.json")

# 🔄 Сессия
db: Session = SessionLocal()

# 🧹 Удаляем старые вопросы
print("🧹 Удаляю старые вопросы из core_questions...")
db.query(CoreQuestion).delete()
db.commit()
print("✅ Старые вопросы удалены.")

# 📥 Загружаем JSON
try:
    with open(file_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
except Exception as e:
    raise Exception(f"❌ Ошибка чтения файла: {e}")

# ➕ Добавляем новые
added = 0
for q in questions:
    if "question_a" in q and "question_b" in q and "position" in q:
        new_q = CoreQuestion(
            question_a=q["question_a"],
            question_b=q["question_b"],
            position=q["position"]
        )
        db.add(new_q)
        added += 1
    else:
        print(f"⚠️ Пропущен вопрос: {q}")

db.commit()
db.close()
print(f"✅ Загружено {added} вопросов в core_questions.")
