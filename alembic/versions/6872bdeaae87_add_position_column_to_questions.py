"""Add position column to questions

Revision ID: 6872bdeaae87
Revises: f2a905caa691
Create Date: 2025-03-29 22:25:36.203006
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '6872bdeaae87'
down_revision: Union[str, None] = 'f2a905caa691'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('questions')]
    
    if 'position' not in columns:
        op.add_column('questions', sa.Column('position', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('questions', 'position')
