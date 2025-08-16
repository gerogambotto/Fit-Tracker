"""Add dia field to ejercicios

Revision ID: add_dia_to_ejercicios
Revises: add_performance_indexes
Create Date: 2024-01-01 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_dia_to_ejercicios'
down_revision = 'add_performance_indexes'
branch_labels = None
depends_on = None


def upgrade():
    # Add dia column to ejercicios table
    op.add_column('ejercicios', sa.Column('dia', sa.Integer(), nullable=False, server_default='1'))
    
    # Add index for better performance
    op.create_index('idx_ejercicios_dia', 'ejercicios', ['dia'])


def downgrade():
    # Remove index and column
    op.drop_index('idx_ejercicios_dia', 'ejercicios')
    op.drop_column('ejercicios', 'dia')