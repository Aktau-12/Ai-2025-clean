from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB  # ✅ правильный импорт JSONB для PostgreSQL
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base
from app.models.user import User  # ✅ добавлен импорт

# 🧠 Таблица Тестов (например: CoreTalents, Big Five, MBTI)
class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    test_type = Column(String, nullable=True)  # ✅ добавлено поле test_type

    # Отношение к вопросам
    questions = relationship("Question", back_populates="test")


# 📝 Таблица Вопросов, связанная с Test
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    text = Column(String, nullable=False)
    position = Column(Integer, nullable=True)  # ✅ добавлено поле position

    # Обратная связь на тест
    test = relationship("Test", back_populates="questions")


# 📊 Результаты пользователей
class UserResult(Base):
    __tablename__ = "user_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)  # ✅ связь с tests
    answers = Column(JSONB, nullable=False)  # ✅ исправлено на JSONB
    score = Column(JSONB, nullable=True)     # ✅ исправлено на JSONB
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Обратная связь на пользователя и тест
    user = relationship(User, back_populates="results")  # ✅ правильная связь
    test = relationship("Test")  # 🔁 позволяет получать данные о тесте через result.test
