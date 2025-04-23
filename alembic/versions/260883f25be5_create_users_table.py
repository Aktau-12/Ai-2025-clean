"""create users table

Revision ID: 260883f25be5
Revises: f109b3acf0c4
Create Date: 2025-04-23 15:59:50.259700

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '260883f25be5'
down_revision: Union[str, None] = 'f109b3acf0c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Создаём таблицу users перед user_results
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=True),
        sa.Column('xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('mbti_type', sa.String(length=4), nullable=True),
        sa.Column('archetype', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('users')
