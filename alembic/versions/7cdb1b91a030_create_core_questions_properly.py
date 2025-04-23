"""create core_questions properly and add test_type to tests

Revision ID: 7cdb1b91a030
Revises: 570f2bde43e5
Create Date: 2025-03-25 23:12:17.370823
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = '7cdb1b91a030'
down_revision: Union[str, None] = '570f2bde43e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Проверяем, существует ли таблица core_questions
    conn = op.get_bind()
    result = conn.execute(
        text("""
            SELECT to_regclass('public.core_questions')
        """)
    )
    exists = result.scalar()

    if not exists:
        op.create_table(
            'core_questions',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('question_a', sa.Text(), nullable=False),
            sa.Column('question_b', sa.Text(), nullable=False),
            sa.Column('position', sa.Integer(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # Добавляем колонку test_type в таблицу tests (если её ещё нет)
    table_columns = conn.execute(
        text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'tests' AND column_name = 'test_type'
        """)
    ).fetchall()

    if not table_columns:
        op.add_column('tests', sa.Column('test_type', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('tests', 'test_type')
    op.drop_table('core_questions')
