"""create core_questions properly and add test_type to tests

Revision ID: 7cdb1b91a030
Revises: 570f2bde43e5
Create Date: 2025-03-25 23:12:17.370823
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7cdb1b91a030'
down_revision: Union[str, None] = '570f2bde43e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Создаём таблицу core_questions
    op.create_table(
        'core_questions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('question_a', sa.Text(), nullable=False),
        sa.Column('question_b', sa.Text(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Добавляем колонку test_type в таблицу tests
    op.add_column('tests', sa.Column('test_type', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Удаляем колонку test_type из таблицы tests
    op.drop_column('tests', 'test_type')
    
    # Удаляем таблицу core_questions
    op.drop_table('core_questions')
