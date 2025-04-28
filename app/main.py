from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import subprocess

# ✅ Загружаем .env до любых операций с переменными окружения
load_dotenv(Path(__file__).resolve().parent / ".env")

# ✅ Выполняем alembic upgrade после загрузки .env
subprocess.run(["alembic", "upgrade", "head"], check=True)

print("✅ MAIN.PY ЗАПУЩЕН")

# ✅ Инициализация приложения
app = FastAPI(
    title="AI Profiler",
    description="🧠 Платформа для психологических тестов, саморазвития и AI-помощи",
    version="1.0.0",
)

# 🌐 Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Разрешаем все источники для упрощения разработки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Импорт роутов
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

# ✅ Подключение роутеров
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(test.router, prefix="/tests", tags=["Tests"])
app.include_router(coretalents.router, prefix="/coretalents", tags=["CoreTalents"])
app.include_router(mbti.router, prefix="/mbti", tags=["MBTI"])
app.include_router(hero.router, prefix="/hero", tags=["Hero"])
app.include_router(rating.router, prefix="/rating", tags=["Rating"])
app.include_router(habit.router, prefix="/habits", tags=["Habits"])
app.include_router(thinking_algorithm.router, prefix="/thinking", tags=["Thinking Algorithm"])
app.include_router(life_wheel.router, prefix="/life-wheel", tags=["Life Wheel"])  # ✅ Теперь всё правильно

# ── Поддержка GET и HEAD для корневого пути ─────────────────
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "✅ AI Profiler работает!"}
