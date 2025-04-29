import os
import subprocess
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─── 1. Загрузка переменных окружения из .env ─────────────────────────────
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)
print(f"✅ Loaded .env from: {env_path}")

# ─── 2. Выполнение миграций Alembic ────────────────────────────────────────
try:
    subprocess.run(["alembic", "upgrade", "head"], check=True)
    print("✅ Alembic migrations applied successfully")
except subprocess.CalledProcessError as e:
    print(f"❌ Error applying Alembic migrations: {e}")

# ─── 3. Инициализация FastAPI приложения ───────────────────────────────────
app = FastAPI(
    title="AI Profiler",
    description="🧠 Платформа для психологических тестов, саморазвития и AI-помощи",
    version="1.0.0",
)

# ─── 4. Настройка CORS ─────────────────────────────────────────────────────
frontend_url = os.getenv("FRONTEND_URL", "https://ai-2025-clean-1.onrender.com")
backend_url = os.getenv("BACKEND_URL", "https://ai-2025-clean.onrender.com")
origins = [frontend_url, backend_url]
print(f"🔐 CORS allow_origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── 5. Импорт и регистрация роутеров ──────────────────────────────────────
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

# ─── 6. Корневой маршрут ───────────────────────────────────────────────────
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "✅ AI Profiler работает!"}
