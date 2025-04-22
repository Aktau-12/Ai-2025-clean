from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Строка подключения к БД
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:Kazled12@localhost:5432/ai_profiler"

# Создаём движок SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Создаём сессию
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# ✅ Функция-зависимость для подключения к БД
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
