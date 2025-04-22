
import json
import os
import sys
from sqlalchemy.orm import Session

# Добавляем путь к папке 'app' в sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, "app"))

from models.coretalents import CoreQuestion
from database.db import SessionLocal

# Загрузка данных из оригинального файла
with open("coretalents_34_questions (1).json", "r", encoding="utf-8") as f:
    questions = json.load(f)

# Открытие сессии
db: Session = SessionLocal()

# Загрузка вопросов
for item in questions:
    question = CoreQuestion(
        question_a=item["question_a"],
        question_b=item["question_b"],
        position=item["position"]
    )
    db.add(question)

# Сохранение и закрытие
db.commit()
db.close()

print(f"✅ Загружено {len(questions)} вопросов CoreTalents")
