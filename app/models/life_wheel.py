from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

class LifeWheelResult(Base):
    __tablename__ = "life_wheel"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scores = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь обратно к User
    user = relationship("User", back_populates="life_wheel_results")
