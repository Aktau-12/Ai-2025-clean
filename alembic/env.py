from logging.config import fileConfig
import sys, os
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

# ── ЗАГРУЗКА .env И ПОДСТАНОВКА DATABASE_URL ДЛЯ ALEMBIC ────────────────
# Определяем путь к корневому .env
env_path = Path(__file__).resolve().parent.parent / ".env"
# Загружаем переменные окружения из .env (не перезаписывая уже установленные)
load_dotenv(env_path)
# Явно читаем .env, чтобы гарантировать доступ к значениям
env_values = dotenv_values(env_path)

from alembic import context
from sqlalchemy import engine_from_config, pool

# Конфигурация Alembic
config = context.config

# Получаем URL из окружения или .env
db_url = os.getenv("DATABASE_URL") or env_values.get("DATABASE_URL")
if not db_url:
    raise RuntimeError(f"❌ DATABASE_URL не задана ни в окружении, ни в {env_path}")
# Подставляем URL миграций
config.set_main_option("sqlalchemy.url", db_url)

# Настройка логирования Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Добавляем путь к корню проекта для импорта app.*
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Импорт метаданных всех моделей
from app.database.db import Base
from app.models import user, test, strengths, coretalents, mbti, hero

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

# Выбор режима запуска
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
