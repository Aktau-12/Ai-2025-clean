"""merge users and previous migrations

Revision ID: 230bfb0ba8f1
Revises: 260883f25be5, 5efe78d9a9b8
Create Date: 2025-04-23 16:48:13.037683

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '230bfb0ba8f1'
down_revision: Union[str, None] = ('260883f25be5', '5efe78d9a9b8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
