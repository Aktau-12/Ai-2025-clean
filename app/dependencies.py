# app/dependencies.py

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from dotenv import load_dotenv

# ✅ Загружаем .env из app/
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path)

# 🔐 JWT конфигурация
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

if not SECRET_KEY:
    raise RuntimeError("❌ SECRET_KEY не найден в .env")

# ✅ Авторизация по токену (auth/login — без начального слэша)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 🔎 Получить текущего пользователя по токену
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="⛔ Токен не содержит информацию о пользователе",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="⛔ Невозможно проверить токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == subject).first()
    if user is None:
        raise HTTPException(status_code=404, detail="⛔ Пользователь не найден")

    return user
