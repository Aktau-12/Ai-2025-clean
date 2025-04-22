from sqlalchemy import Column, Integer, String, Text
from app.database.db import Base

class Strength(Base):
    __tablename__ = "strengths"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
