"""Add dia field to comidas

Revision ID: add_dia_to_comidas
Revises: add_dia_to_ejercicios
Create Date: 2024-01-01 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_dia_to_comidas'
down_revision = 'add_dia_to_ejercicios'
branch_labels = None
depends_on = None


def upgrade():
    # Add dia column to comidas table
    op.add_column('comidas', sa.Column('dia', sa.Integer(), nullable=False, server_default='1'))
    
    # Add index for better performance
    op.create_index('idx_comidas_dia', 'comidas', ['dia'])


def downgrade():
    # Remove index and column
    op.drop_index('idx_comidas_dia', 'comidas')
    op.drop_column('comidas', 'dia')