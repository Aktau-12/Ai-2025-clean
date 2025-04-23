import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
from pathlib import Path

# 🔄 Загружаем .env только локально (на Render всё из окружения)
if os.getenv("RENDER") is None:
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ✅ Получаем строку подключения из окружения
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# ⛔ Если переменная не найдена — бросаем ошибку (чтобы не было сюрпризов)
if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("❌ DATABASE_URL не задан. Убедись, что переменная окружения присутствует.")

# 🔧 SQLAlchemy engine + сессия
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ Зависимость FastAPI
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
