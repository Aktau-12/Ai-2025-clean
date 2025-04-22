"""add archtype column again

Revision ID: 3f5aaa3b027a
Revises: 6c5d9f9ced3e
Create Date: 2025-04-11 19:38:49.213300
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '3f5aaa3b027a'
down_revision: Union[str, None] = '6c5d9f9ced3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('users', sa.Column('archtype', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('users', 'archtype')
