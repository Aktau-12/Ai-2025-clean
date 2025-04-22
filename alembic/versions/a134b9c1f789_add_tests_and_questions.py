"""add tests and questions tables

Revision ID: a134b9c1f789
Revises: 1224d8127e99
Create Date: 2025-04-13 19:30:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a134b9c1f789'
down_revision = '1224d8127e99'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'tests',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('description', sa.String(), nullable=True),
    )

    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('test_id', sa.Integer(), sa.ForeignKey('tests.id'), nullable=False),
        sa.Column('text', sa.String(), nullable=False),
    )


def downgrade():
    op.drop_table('questions')
    op.drop_table('tests')
