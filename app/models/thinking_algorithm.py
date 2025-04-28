# app/models/thinking_algorithm.py

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base
from datetime import datetime

class ThinkingAlgorithm(Base):
    __tablename__ = "thinking_algorithm"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answers = Column(Text, nullable=False)  # Сохраняем все шаги одним JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="thinking_entries")
