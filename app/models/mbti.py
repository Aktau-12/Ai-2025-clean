from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database.db import Base

class MBTIQuestion(Base):
    __tablename__ = "mbti_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_a = Column(Text, nullable=False)  # ✅ Первая часть утверждения
    question_b = Column(Text, nullable=False)  # ✅ Вторая часть утверждения
    dimension = Column(String(10), nullable=False)  # EI, SN, TF, JP
    trait_a = Column(String(1), nullable=False)  # E/S/T/J
    trait_b = Column(String(1), nullable=False)  # I/N/F/P
    position = Column(Integer, nullable=False)  # Порядок отображения

class MBTIResult(Base):
    __tablename__ = "mbti_results"

    id = Column(Integer, primary_key=True, index=True)
    type_code = Column(String(4), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    extended_description = Column(Text, nullable=True)  # ✅ Добавлено поле с расширенным описанием

class MBTIAnswer(Base):
    __tablename__ = "mbti_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, nullable=False)
    answer = Column(String(1), nullable=False)  # E/I/S/N/T/F/J/P/X
