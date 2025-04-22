"""Add timestamp to user_results

Revision ID: 1224d8127e99
Revises: ef8fdf490790
Create Date: 2025-04-11 20:49:22.787733
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1224d8127e99'
down_revision: Union[str, None] = 'ef8fdf490790'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('user_results', sa.Column('timestamp', sa.DateTime(), nullable=True))

    # Изменение типа колонки answers с TEXT на JSON с использованием явного преобразования
    op.alter_column(
        'user_results',
        'answers',
        existing_type=sa.TEXT(),
        type_=sa.JSON(),
        existing_nullable=False,
        postgresql_using="answers::json"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'user_results',
        'answers',
        existing_type=sa.JSON(),
        type_=sa.TEXT(),
        existing_nullable=False
    )
    op.drop_column('user_results', 'timestamp')
