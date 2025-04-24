# app/init_tests.py
from app.database.db import SessionLocal
from app.models.test import Test

db = SessionLocal()

tests = [
    Test(id=1, name="CoreTalents 34", description="Тест на таланты CoreTalents"),
    Test(id=2, name="Big Five", description="Пятифакторная модель личности"),
    Test(id=3, name="MBTI", description="16 типов личности по MBTI"),
]

for test in tests:
    db.merge(test)

db.commit()
db.close()

print("✅ Тесты успешно добавлены в таблицу tests.")
