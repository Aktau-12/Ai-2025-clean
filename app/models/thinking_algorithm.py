# app/models/thinking_algorithm.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

class ThinkingAlgorithm(Base):
    __tablename__ = "thinking_algorithm"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    answers = Column(String, nullable=False)  # JSON-строка с ответами на шаги
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="thinking_algorithms")


