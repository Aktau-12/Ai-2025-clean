from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base
from app.models.hero import UserHeroProgress, UserHeroStep

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    mbti_type = Column(String, nullable=True)
    archetype = Column(String, nullable=True)
    xp = Column(Integer, default=0)

    # Один-к-одному: XP (UserHeroProgress)
    hero_progress = relationship(UserHeroProgress, back_populates="user", uselist=False)

    # Один-ко-многим: шаги пути героя
    hero_step_progress = relationship(UserHeroStep, back_populates="user")

    # Один-ко-многим: результаты тестов
    results = relationship("UserResult", back_populates="user")

    # ✅ Новый блок: один-ко-многим: ThinkingAlgorithm
    thinking_entries = relationship("ThinkingAlgorithm", back_populates="user", cascade="all, delete")

    # ✅ Новый блок: один-ко-многим: LifeWheel
    life_wheel_entries = relationship("LifeWheel", back_populates="user", cascade="all, delete")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name}, created_at={self.created_at})>"
