"""Update MBTIQuestion to use question_a/question_b

Revision ID: c61da662bff6
Revises: 65152c1eea77
Create Date: 2025-04-10 14:06:50.074361
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c61da662bff6'
down_revision: Union[str, None] = '65152c1eea77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Добавляем новые поля как nullable=True, чтобы избежать ошибки при наличии существующих данных
    op.add_column('mbti_questions', sa.Column('question_a', sa.String(), nullable=True))
    op.add_column('mbti_questions', sa.Column('question_b', sa.String(), nullable=True))
    op.add_column('mbti_questions', sa.Column('dichotomy', sa.String(length=10), nullable=True))

    # ❗️Важно: поля `text`, `trait`, `dimension` НЕ удаляем, пока не сконвертируем данные вручную или скриптом
    # ❗️После этого можно будет создать отдельную миграцию для их удаления и установки nullable=False на новые поля


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем новые поля
    op.drop_column('mbti_questions', 'dichotomy')
    op.drop_column('mbti_questions', 'question_b')
    op.drop_column('mbti_questions', 'question_a')

    # Старые поля остаются
