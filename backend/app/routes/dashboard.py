from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Coach, Alumno, Rutina
from app.middleware.auth import get_current_coach

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
def get_dashboard(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    # Total de alumnos
    total_alumnos = db.query(Alumno).filter(Alumno.coach_id == coach.id).count()
    
    # Total de rutinas activas
    total_rutinas = db.query(Rutina).join(Alumno).filter(
        Alumno.coach_id == coach.id,
        Rutina.activa == True,
        Rutina.eliminado == False
    ).count()
    
    # Últimos alumnos añadidos (últimos 5)
    ultimos_alumnos = db.query(Alumno).filter(
        Alumno.coach_id == coach.id
    ).order_by(Alumno.creado_en.desc()).limit(5).all()
    
    return {
        "total_alumnos": total_alumnos,
        "total_rutinas": total_rutinas,
        "ultimos_alumnos": [
            {
                "id": alumno.id,
                "nombre": alumno.nombre,
                "email": alumno.email,
                "creado_en": alumno.creado_en
            }
            for alumno in ultimos_alumnos
        ]
    }