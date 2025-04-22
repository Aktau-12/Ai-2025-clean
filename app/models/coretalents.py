from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.db import Base

class CoreQuestion(Base):
    __tablename__ = "core_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_a = Column(String, nullable=False)
    question_b = Column(String, nullable=False)
    position = Column(Integer, nullable=False)
