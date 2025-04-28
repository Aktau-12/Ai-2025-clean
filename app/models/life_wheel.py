# app/models/life_wheel.py

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base
from datetime import datetime

class LifeWheel(Base):
    __tablename__ = "life_wheel"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    data = Column(Text, nullable=False)  # JSON данные колесо жизни
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="life_wheel_entries")
