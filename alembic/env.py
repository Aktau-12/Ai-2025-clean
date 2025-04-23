from logging.config import fileConfig
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# ── ЗАГРУЗКА ENV И ПОДСТАНОВКА DATABASE_URL ДЛЯ ALEMBIC ─────────────────
# Читаем .env из корня проекта
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("❌ DATABASE_URL не задана в окружении для Alembic")

from alembic import context
from sqlalchemy import engine_from_config, pool

# Добавляем путь к корню проекта, чтобы Alembic видел приложение
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Импортируем метаданные из SQLAlchemy
from app.database.db import Base
from app.models import user, test, strengths, coretalents, mbti, hero

target_metadata = Base.metadata

# Конфигурация Alembic
config = context.config

# Переопределяем URL миграций реальным из окружения
config.set_main_option("sqlalchemy.url", db_url)

# Настройка логирования Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
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
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# Запускаем миграции в нужном режиме
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
