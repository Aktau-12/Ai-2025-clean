import sys
import os
from sqlalchemy import create_engine, MetaData, Table, update

# Добавляем корень проекта, чтобы можно было импортировать app.*
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.db import SQLALCHEMY_DATABASE_URL

# Подключение к БД
engine = create_engine(SQLALCHEMY_DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

# Получаем таблицу tests
tests = Table("tests", metadata, autoload_with=engine)

# Обновляем название теста
with engine.connect() as conn:
    stmt = (
        update(tests)
        .where(tests.c.name == "Gallup StrengthsFinder")
        .values(name="CoreTalents 34")
    )
    result = conn.execute(stmt)
    conn.commit()
    print(f"✅ Название теста обновлено! Изменено строк: {result.rowcount}")
