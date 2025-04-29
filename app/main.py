from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import subprocess

# ✅ Загружаем переменные окружения из .env
load_dotenv(Path(__file__).resolve().parent / ".env")

# ✅ Выполняем миграции базы данных
subprocess.run(["alembic", "upgrade", "head"], check=True)

print("✅ MAIN.PY ЗАПУЩЕН")

# ✅ Инициализация FastAPI-приложения
app = FastAPI(
    title="AI Profiler",
    description="🧠 Платформа для психологических тестов, саморазвития и AI-помощи",
    version="1.0.0",
)

# 🌐 Настройка CORS — разрешаем только frontend Render-домены
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-2025-clean-1.onrender.com"  # ← твой frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Импорт и подключение роутеров
from app.routes import (
    auth,
    user,
    test,
    coretalents,
    mbti,
    hero,
    rating,
    habit,
    thinking_algorithm,
    life_wheel,
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(test.router, prefix="/tests", tags=["Tests"])
app.include_router(coretalents.router, prefix="/coretalents", tags=["CoreTalents"])
app.include_router(mbti.router, prefix="/mbti", tags=["MBTI"])
app.include_router(hero.router, prefix="/hero", tags=["Hero"])
app.include_router(rating.router, prefix="/rating", tags=["Rating"])
app.include_router(habit.router, prefix="/habits", tags=["Habits"])
app.include_router(thinking_algorithm.router, prefix="/thinking", tags=["Thinking Algorithm"])
app.include_router(life_wheel.router, prefix="/life-wheel", tags=["Life Wheel"])

# 🔄 Корневой маршрут
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "✅ AI Profiler работает!"}
