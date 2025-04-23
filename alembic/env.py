from logging.config import fileConfig
import sys
import os

# 🔄 Подключаем .env для SQLAlchemy URL
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# ✅ Добавляем путь к корню проекта, чтобы импортировать app.*
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ✅ Импортируем Base и все модели, чтобы Alembic их видел
from app.database.db import Base
from app.models import user, test, strengths, coretalents, mbti, hero

# ✅ Устанавливаем метаданные для генерации миграций
target_metadata = Base.metadata

# Alembic конфиг
config = context.config

# 📋 Настройка логирования
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 🚀 Миграции в оффлайн-режиме
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

# 🚀 Миграции в онлайн-режиме
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

# 🔁 Выбор режима запуска
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
