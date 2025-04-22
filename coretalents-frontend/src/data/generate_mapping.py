import json
import psycopg2

# Подключение к базе
conn = psycopg2.connect(
    dbname="ai_profiler",
    user="admin",
    password="Kazled12",
    host="localhost",
    port=5432
)

cur = conn.cursor()
cur.execute("SELECT id FROM questions WHERE test_id = 1 ORDER BY id")
question_ids = [row[0] for row in cur.fetchall()]

# Генерация: каждые 3 вопроса — один талант
mapping = []
talent_id = 1
for i, qid in enumerate(question_ids):
    mapping.append({
        "question_id": qid,
        "talent_id": talent_id
    })
    if (i + 1) % 3 == 0:
        talent_id += 1

# Сохранение
with open("coretalents_question_mapping.json", "w", encoding="utf-8") as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)

print("✅ mapping сохранён как coretalents_question_mapping.json")
