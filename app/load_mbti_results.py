import json
import os
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.mbti import MBTIResult

def load_results():
    db: Session = SessionLocal()

    try:
        # Путь к файлу внутри папки app/data
        path = os.path.join(os.path.dirname(__file__), "data", "mbti_results.json")

        with open(path, "r", encoding="utf-8") as file:
            results = json.load(file)

        db.query(MBTIResult).delete()  # Удаление старых записей

        for result in results:
            mbti_result = MBTIResult(
                type_code=result["type_code"],
                description=result["description"],
                extended_description=result.get("extended_description")  # ✅ безопасно добавлено
            )
            db.add(mbti_result)

        db.commit()
        print(f"✅ Загружено {len(results)} MBTI результатов.")
    except Exception as e:
        db.rollback()
        print("❌ Ошибка при загрузке MBTI:", e)
    finally:
        db.close()

if __name__ == "__main__":
    load_results()
