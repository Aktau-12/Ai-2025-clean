from pydantic import BaseModel

class RatingUser(BaseModel):
    user_id: int
    username: str
    xp: int
