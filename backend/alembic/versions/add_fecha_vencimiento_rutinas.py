"""Add fecha_vencimiento to rutinas

Revision ID: add_fecha_vencimiento_rutinas
Revises: add_dia_to_comidas
Create Date: 2024-01-01 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_fecha_vencimiento_rutinas'
down_revision = 'add_dia_to_comidas'
branch_labels = None
depends_on = None


def upgrade():
    # Add fecha_vencimiento column to rutinas table
    op.add_column('rutinas', sa.Column('fecha_vencimiento', sa.DateTime(), nullable=True))
    
    # Add index for better performance
    op.create_index('idx_rutinas_fecha_vencimiento', 'rutinas', ['fecha_vencimiento'])


def downgrade():
    # Remove index and column
    op.drop_index('idx_rutinas_fecha_vencimiento', 'rutinas')
    op.drop_column('rutinas', 'fecha_vencimiento')