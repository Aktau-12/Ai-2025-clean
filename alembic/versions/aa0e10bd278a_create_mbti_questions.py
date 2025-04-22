"""create mbti_questions

Revision ID: aa0e10bd278a
Revises: d9646845f197
Create Date: 2025-03-29 23:23:40.834111
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import uuid


# revision identifiers, used by Alembic.
revision: str = 'aa0e10bd278a'
down_revision: Union[str, None] = 'd9646845f197'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'mbti_questions',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('dimension', sa.String(length=2), nullable=False),  # Пример: IE, SN, TF, JP
        sa.Column('position', sa.Integer(), nullable=False)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('mbti_questions')
