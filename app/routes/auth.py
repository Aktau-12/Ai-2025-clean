# app/routes/auth.py
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.user import User

# ─── Загрузка .env из корня проекта ────────────────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ─── JWT / безопасность ───────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

if not SECRET_KEY:
    raise RuntimeError("❌ SECRET_KEY не найден в .env")

# ─── Инициализация ────────────────────────────────────────────────────────
router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ─── Pydantic-модели ───────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# ─── Утилиты для работы с паролями ────────────────────────────────────────
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ─── Утилита для создания JWT ─────────────────────────────────────────────
def create_access_token(sub: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"sub": sub, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ─── Зависимость: сессия БД ────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Зависимость: текущий пользователь ─────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="⛔️ Недопустимый или просроченный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="⛔️ Пользователь не найден")
    return user


# ─── Регистрация ─────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    req: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Проверяем, что пользователя нет
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="⛔️ Пользователь уже существует")

    # Хешируем и сохраняем
    hashed = get_password_hash(req.password)
    user = User(email=req.email, password_hash=hashed, name=req.name or req.email, xp=0)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Отдаём токен
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


# ─── Логин ───────────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="⛔️ Неверный логин или пароль")

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


# ─── Тест защищённого маршрута ────────────────────────────────────────────
@router.get("/protected", status_code=status.HTTP_200_OK)
def protected_route(user: User = Depends(get_current_user)):
    return {"message": f"Привет, {user.name}! 🔐 Это защищённый маршрут."}
