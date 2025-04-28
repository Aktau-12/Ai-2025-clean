"""Add thinking_algorithm and life_wheel tables

Revision ID: 077b02ce7c09
Revises: 760f92cc1748
Create Date: 2025-04-28 15:20:06.896479
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '077b02ce7c09'
down_revision = '760f92cc1748'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Создаём таблицу thinking_algorithm
    op.create_table(
        'thinking_algorithm',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('answers', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=func.now()),
    )
    # Создаём таблицу life_wheel
    op.create_table(
        'life_wheel',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('scores', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=func.now()),
    )


def downgrade() -> None:
    # Удаляем таблицу life_wheel
    op.drop_table('life_wheel')
    # Удаляем таблицу thinking_algorithm
    op.drop_table('thinking_algorithm')
