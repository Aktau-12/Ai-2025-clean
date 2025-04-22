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
    archetype = Column(String, nullable=True)  # ✅ Исправлено

    # Один-к-одному: XP (связь с UserHeroProgress)
    hero_progress = relationship(UserHeroProgress, back_populates="user", uselist=False)

    # Один-ко-многим: шаги пути героя
    hero_step_progress = relationship(UserHeroStep, back_populates="user")

    # ⚠️ Исправлено: строка вместо импорта (чтобы избежать циклического импорта)
    results = relationship("UserResult", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name}, created_at={self.created_at})>"
