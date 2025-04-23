#!/usr/bin/env python3
"""
show_structure.py

Отражает и печатает структуру базы данных: таблицы и их столбцы.
Запуск:
  python show_structure.py          # использует DATABASE_URL из .env
  python show_structure.py --local  # использует LOCAL_DATABASE_URL из окружения
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData

# Путь к корневому .env рядом со скриптом
env_path = Path(__file__).resolve().parent / ".env"

# Определяем, какой URL использовать
if "--local" in sys.argv:
    # Ожидаем, что переменная LOCAL_DATABASE_URL уже установлена в окружении
    db_url = os.getenv("LOCAL_DATABASE_URL")
    if not db_url:
        raise RuntimeError("LOCAL_DATABASE_URL не задана в окружении для локального режима")
    print("ℹ️ Используется локальный URL БД из LOCAL_DATABASE_URL")
else:
    # Загружаем .env для получения DATABASE_URL
    if not env_path.exists():
        raise FileNotFoundError(f".env файл не найден по пути {env_path}")
    load_dotenv(env_path)
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError(f"DATABASE_URL не найден в {env_path}")
    print(f"ℹ️ Используется URL БД из {env_path}")

# Создаем движок SQLAlchemy и отражаем схему
engine = create_engine(db_url)
metadata = MetaData()
metadata.reflect(bind=engine)

# Вывод структуры базы
for table in metadata.sorted_tables:
    print(f"Таблица: {table.name}")
    for col in table.columns:
        print(f"  - {col.name}: {col.type}")
    print()
