"""Fix UserResult score field to JSONB properly

Revision ID: fix_userresult_jsonb_final
Revises: 077b02ce7c09
Create Date: 2025-04-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_userresult_jsonb_final'
down_revision = '077b02ce7c09'
branch_labels = None
depends_on = None


def upgrade():
    # Удаляем старую колонку score
    op.drop_column('user_results', 'score')
    # Добавляем новую колонку score типа JSONB
    op.add_column('user_results', sa.Column('score', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade():
    # Откат изменений: удаляем колонку JSONB и возвращаем integer
    op.drop_column('user_results', 'score')
    op.add_column('user_results', sa.Column('score', sa.Integer(), nullable=True))
