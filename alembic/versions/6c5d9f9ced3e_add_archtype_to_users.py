"""Add archtype to users

Revision ID: 6c5d9f9ced3e
Revises: b764141843e2
Create Date: 2025-04-11 19:33:17.970148
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6c5d9f9ced3e'
down_revision: Union[str, None] = 'b764141843e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('archtype', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'archtype')
