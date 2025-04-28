# app/models/life_wheel.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

class LifeWheelResult(Base):
    __tablename__ = "life_wheel"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scores = Column(String, nullable=False)  # JSON-строка с оценками по сферам
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="life_wheel_results")

