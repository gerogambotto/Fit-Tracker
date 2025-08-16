"""Add performance indexes

Revision ID: add_performance_indexes
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes for better query performance
    op.create_index('idx_alumnos_coach_id', 'alumnos', ['coach_id'])
    op.create_index('idx_alumnos_fecha_cobro', 'alumnos', ['fecha_cobro'])
    op.create_index('idx_alumnos_notificaciones_activas', 'alumnos', ['notificaciones_activas'])
    
    op.create_index('idx_pesos_alumno_alumno_id', 'pesos_alumno', ['alumno_id'])
    op.create_index('idx_pesos_alumno_fecha', 'pesos_alumno', ['fecha'])
    
    op.create_index('idx_rutinas_alumno_id', 'rutinas', ['alumno_id'])
    op.create_index('idx_rutinas_activa', 'rutinas', ['activa'])
    op.create_index('idx_rutinas_eliminado', 'rutinas', ['eliminado'])
    
    op.create_index('idx_ejercicios_rutina_id', 'ejercicios', ['rutina_id'])
    op.create_index('idx_ejercicios_ejercicio_base_id', 'ejercicios', ['ejercicio_base_id'])
    
    op.create_index('idx_personal_records_alumno_id', 'personal_records', ['alumno_id'])
    op.create_index('idx_personal_records_ejercicio', 'personal_records', ['ejercicio'])
    op.create_index('idx_personal_records_fecha', 'personal_records', ['fecha'])
    
    op.create_index('idx_dietas_alumno_id', 'dietas', ['alumno_id'])
    op.create_index('idx_dietas_activa', 'dietas', ['activa'])
    op.create_index('idx_dietas_eliminado', 'dietas', ['eliminado'])
    
    op.create_index('idx_comidas_dieta_id', 'comidas', ['dieta_id'])
    op.create_index('idx_comida_alimentos_comida_id', 'comida_alimentos', ['comida_id'])
    op.create_index('idx_comida_alimentos_alimento_id', 'comida_alimentos', ['alimento_id'])
    
    op.create_index('idx_rutinas_plantilla_coach_id', 'rutinas_plantilla', ['coach_id'])
    op.create_index('idx_dietas_plantilla_coach_id', 'dietas_plantilla', ['coach_id'])


def downgrade():
    # Remove indexes
    op.drop_index('idx_alumnos_coach_id', 'alumnos')
    op.drop_index('idx_alumnos_fecha_cobro', 'alumnos')
    op.drop_index('idx_alumnos_notificaciones_activas', 'alumnos')
    
    op.drop_index('idx_pesos_alumno_alumno_id', 'pesos_alumno')
    op.drop_index('idx_pesos_alumno_fecha', 'pesos_alumno')
    
    op.drop_index('idx_rutinas_alumno_id', 'rutinas')
    op.drop_index('idx_rutinas_activa', 'rutinas')
    op.drop_index('idx_rutinas_eliminado', 'rutinas')
    
    op.drop_index('idx_ejercicios_rutina_id', 'ejercicios')
    op.drop_index('idx_ejercicios_ejercicio_base_id', 'ejercicios')
    
    op.drop_index('idx_personal_records_alumno_id', 'personal_records')
    op.drop_index('idx_personal_records_ejercicio', 'personal_records')
    op.drop_index('idx_personal_records_fecha', 'personal_records')
    
    op.drop_index('idx_dietas_alumno_id', 'dietas')
    op.drop_index('idx_dietas_activa', 'dietas')
    op.drop_index('idx_dietas_eliminado', 'dietas')
    
    op.drop_index('idx_comidas_dieta_id', 'comidas')
    op.drop_index('idx_comida_alimentos_comida_id', 'comida_alimentos')
    op.drop_index('idx_comida_alimentos_alimento_id', 'comida_alimentos')
    
    op.drop_index('idx_rutinas_plantilla_coach_id', 'rutinas_plantilla')
    op.drop_index('idx_dietas_plantilla_coach_id', 'dietas_plantilla')