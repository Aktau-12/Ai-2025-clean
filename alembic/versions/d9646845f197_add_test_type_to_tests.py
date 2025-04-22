"""add test_type to tests

Revision ID: d9646845f197
Revises: 6872bdeaae87
Create Date: 2025-03-29 23:22:08.042140

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9646845f197'
down_revision: Union[str, None] = '6872bdeaae87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
