# app/schemas/life_wheel.py

from pydantic import BaseModel
from typing import Dict

class LifeWheelSchema(BaseModel):
    scores: Dict[str, int]
