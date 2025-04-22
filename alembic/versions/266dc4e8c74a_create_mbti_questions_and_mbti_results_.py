"""create mbti_questions and mbti_results tables

Revision ID: 266dc4e8c74a
Revises: 00ede2b962b4
Create Date: 2025-03-30 00:14:51.600787

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '266dc4e8c74a'
down_revision: Union[str, None] = '00ede2b962b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('mbti_questions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('dimension', sa.String(length=10), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False)
    )
    op.create_table('mbti_results',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('type_code', sa.String(length=4), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('mbti_results')
    op.drop_table('mbti_questions')
