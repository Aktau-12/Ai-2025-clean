from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

class ThinkingAlgorithm(Base):
    __tablename__ = "thinking_algorithm"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answers = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь обратно к User
    user = relationship("User", back_populates="thinking_algorithms")
