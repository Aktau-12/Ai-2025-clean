from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os

# 🔄 Загружаем переменные окружения из app/.env
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

# 📦 Импорт роутеров
from app.routes import user, auth, test, coretalents, mbti, hero, rating, habit

# 🚀 Создание FastAPI приложения
app = FastAPI(
    title="AI Profiler",
    description="🧠 Платформа для психологических тестов, саморазвития и AI-помощи",
    version="1.0.0",
)

# 🌍 Разрешённые источники (оба домена + локальная разработка)
origins = [
    "https://ai-2025-clean.onrender.com",    # Бэкенд
    "https://ai-2025-clean-1.onrender.com",  # Фронтенд
    "http://127.0.0.1:5173",                 # Локальная разработка
]

# 🛡️ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Обязательно для передачи токенов
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 Подключение маршрутов
app.include_router(user.router,        prefix="/users",       tags=["Users"])
app.include_router(auth.router,        prefix="/auth",        tags=["Auth"])
app.include_router(test.router,        prefix="/tests",       tags=["Tests"])
app.include_router(coretalents.router, prefix="/coretalents", tags=["CoreTalents"])
app.include_router(mbti.router,        prefix="/mbti",        tags=["MBTI"])
app.include_router(hero.router,        prefix="/hero",        tags=["Hero"])
app.include_router(rating.router,      prefix="/rating",      tags=["Rating"])
app.include_router(habit.router,       prefix="/habits",      tags=["Habits"])

# 🔍 Домашняя страница
@app.get("/")
def home():
    return {"message": "✅ AI Profiler успешно работает!"}
