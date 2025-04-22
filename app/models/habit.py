from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database.db import Base
from datetime import datetime

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    description = Column(String, nullable=True)

class UserHabit(Base):
    __tablename__ = "user_habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    days = Column(JSON, default=[])
    done_today = Column(Boolean, default=False)
    streak = Column(Integer, default=0)
    week_log = Column(JSON, default=[False, False, False, False, False, False, False])  # 📅 календарь за неделю
