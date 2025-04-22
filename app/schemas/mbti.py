from typing import List, Literal, Optional, Dict
from pydantic import BaseModel

class MBTIAnswerItem(BaseModel):
    question_id: int
    answer: Literal["E", "I", "S", "N", "T", "F", "J", "P", "X"]  # ✅ Добавлен 'X'
    trait_a: str
    trait_b: str

class MBTIAnswerSchema(BaseModel):
    answers: List[MBTIAnswerItem]

class MBTIResultSchema(BaseModel):
    type_code: str
    description: str
    extended_description: Optional[str] = None  # ✅ Добавлено новое поле
    details: Optional[Dict[str, int]] = None    # ✅ Если у тебя возвращаются баллы по шкалам

    class Config:
        from_attributes = True  # ✅ актуально для Pydantic v2
