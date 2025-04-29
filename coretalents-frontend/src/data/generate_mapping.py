import json
import psycopg2
import os
from dotenv import load_dotenv

# ✅ Загружаем .env для безопасности
load_dotenv()

# ✅ Подключение к базе через переменные окружения
conn = psycopg2.connect(
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432")
)

cur = conn.cursor()

# ✅ Проверяем таблицу на наличие вопросов
cur.execute("SELECT id FROM questions WHERE test_id = 1 ORDER BY id")
question_ids = [row[0] for row in cur.fetchall()]

if len(question_ids) % 3 != 0:
    raise ValueError(f"❗ Количество вопросов ({len(question_ids)}) не кратно 3. Проверьте базу данных.")

# ✅ Генерация маппинга: каждые 3 вопроса = один талант
mapping = []
talent_id = 1
for i, qid in enumerate(question_ids):
    mapping.append({
        "question_id": qid,
        "talent_id": talent_id
    })
    if (i + 1) % 3 == 0:
        talent_id += 1

# ✅ Сохраняем в файл
output_path = "coretalents_question_mapping.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)

print(f"✅ Mapping успешно сохранён: {output_path}")

# ✅ Чистим соединение
cur.close()
conn.close()
