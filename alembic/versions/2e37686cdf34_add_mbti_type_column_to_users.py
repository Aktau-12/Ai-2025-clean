"""add mbti_type column to users

Revision ID: 2e37686cdf34
Revises: 266dc4e8c74a
Create Date: 2025-03-30 00:22:32.771136
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2e37686cdf34'
down_revision: Union[str, None] = '266dc4e8c74a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('mbti_type', sa.String(length=4), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'mbti_type')
