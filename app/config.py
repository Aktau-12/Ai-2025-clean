import os
from dotenv import load_dotenv

# 🔄 Загружаем переменные окружения из .env
load_dotenv()

# 🔧 Настройки базы данных и токенов
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
