from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

# 🛤 Таблица прогресса по шагам героя
class UserHeroStep(Base):
    __tablename__ = "hero_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    step_id = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="hero_step_progress")  # Связь с пользователем


# 🧬 Таблица XP пользователя
class UserHeroProgress(Base):
    __tablename__ = "user_hero_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    xp = Column(Integer, default=0)

    user = relationship("User", back_populates="hero_progress")
