from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError
from app.database import get_db
from app.models.models import Coach, Alumno, PesoAlumno, PersonalRecord, Dieta
from app.middleware.auth import get_current_coach

router = APIRouter(prefix="/alumnos", tags=["alumnos"])

def get_alumno_by_id_and_coach(alumno_id: int, coach: Coach, db: Session) -> Alumno:
    """Helper function to get alumno by ID and verify coach ownership"""
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    return alumno

class AlumnoCreate(BaseModel):
    nombre: str
    email: str
    fecha_nacimiento: datetime
    altura: float
    objetivo: str
    fecha_cobro: Optional[datetime] = None

class AlumnoUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    fecha_nacimiento: Optional[datetime] = None
    altura: Optional[float] = None
    objetivo: Optional[str] = None
    fecha_cobro: Optional[datetime] = None
    notificaciones_activas: Optional[bool] = None

class PesoCreate(BaseModel):
    peso: float
    fecha: Optional[datetime] = None

class PersonalRecordCreate(BaseModel):
    ejercicio: str
    peso: float
    repeticiones: int = 1
    fecha: Optional[datetime] = None

@router.get("/")
def get_alumnos(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumnos = db.query(Alumno).filter(Alumno.coach_id == coach.id).all()
    return alumnos

@router.post("/")
def create_alumno(alumno_data: AlumnoCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    try:
        new_alumno = Alumno(
            coach_id=coach.id,
            nombre=alumno_data.nombre,
            email=alumno_data.email,
            fecha_nacimiento=alumno_data.fecha_nacimiento,
            altura=alumno_data.altura,
            objetivo=alumno_data.objetivo,
            fecha_cobro=alumno_data.fecha_cobro
        )
        
        db.add(new_alumno)
        db.commit()
        db.refresh(new_alumno)
        
        return new_alumno
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating alumno")

@router.get("/{alumno_id}")
def get_alumno(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    return get_alumno_by_id_and_coach(alumno_id, coach, db)

@router.patch("/{alumno_id}")
def update_alumno(alumno_id: int, alumno_data: AlumnoUpdate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    for field, value in alumno_data.dict(exclude_unset=True).items():
        setattr(alumno, field, value)
    
    db.commit()
    db.refresh(alumno)
    return alumno

@router.delete("/{alumno_id}")
def delete_alumno(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    db.delete(alumno)
    db.commit()
    return {"message": "Alumno deleted successfully"}

@router.get("/{alumno_id}/pesos")
def get_alumno_pesos(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    pesos = db.query(PesoAlumno).filter(PesoAlumno.alumno_id == alumno_id).order_by(PesoAlumno.fecha).all()
    return pesos

@router.post("/{alumno_id}/pesos")
def add_peso(alumno_id: int, peso_data: PesoCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    new_peso = PesoAlumno(
        alumno_id=alumno_id,
        peso=peso_data.peso,
        fecha=peso_data.fecha or datetime.now(timezone.utc)
    )
    
    db.add(new_peso)
    db.commit()
    db.refresh(new_peso)
    
    return new_peso

@router.post("/{alumno_id}/personal-records")
def add_personal_record(alumno_id: int, pr_data: PersonalRecordCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    if pr_data.ejercicio not in ["sentadilla", "press_militar", "press_plano", "peso_muerto"]:
        raise HTTPException(status_code=400, detail="Ejercicio no válido")
    
    new_pr = PersonalRecord(
        alumno_id=alumno_id,
        ejercicio=pr_data.ejercicio,
        peso=pr_data.peso,
        repeticiones=pr_data.repeticiones,
        fecha=pr_data.fecha or datetime.now(timezone.utc)
    )
    
    db.add(new_pr)
    db.commit()
    db.refresh(new_pr)
    
    return new_pr

@router.delete("/personal-records/{pr_id}")
def delete_personal_record(pr_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    pr = db.query(PersonalRecord).join(Alumno).filter(
        PersonalRecord.id == pr_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not pr:
        raise HTTPException(status_code=404, detail="Personal Record not found")
    
    db.delete(pr)
    db.commit()
    return {"message": "Personal Record deleted successfully"}

@router.get("/{alumno_id}/pr-chart")
def get_pr_chart_data(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = get_alumno_by_id_and_coach(alumno_id, coach, db)
    
    prs = db.query(PersonalRecord).filter(
        PersonalRecord.alumno_id == alumno_id
    ).order_by(PersonalRecord.ejercicio, PersonalRecord.fecha).all()
    
    # Group by exercise
    chart_data = {}
    for pr in prs:
        if pr.ejercicio not in chart_data:
            chart_data[pr.ejercicio] = []
        chart_data[pr.ejercicio].append({
            "fecha": pr.fecha.isoformat(),
            "peso": pr.peso,
            "repeticiones": pr.repeticiones
        })
    
    return chart_data

@router.get("/{alumno_id}/dashboard")
def get_alumno_dashboard(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    pesos = db.query(PesoAlumno).filter(PesoAlumno.alumno_id == alumno_id).order_by(PesoAlumno.fecha).all()
    peso_actual = pesos[-1].peso if pesos else None
    
    # Calcular edad
    edad = None
    if alumno.fecha_nacimiento:
        today = datetime.now(timezone.utc).date()
        birth_date = alumno.fecha_nacimiento.date()
        edad = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
    # Obtener personal records
    prs = db.query(PersonalRecord).filter(PersonalRecord.alumno_id == alumno_id).order_by(PersonalRecord.fecha.desc()).all()
    
    return {
        "alumno": {
            "id": alumno.id,
            "nombre": alumno.nombre,
            "email": alumno.email,
            "edad": edad,
            "altura": alumno.altura,
            "objetivo": alumno.objetivo,
            "peso_actual": peso_actual,
            "fecha_cobro": alumno.fecha_cobro
        },
        "historico_pesos": [{"fecha": p.fecha, "peso": p.peso} for p in pesos],
        "personal_records": [{"id": pr.id, "ejercicio": pr.ejercicio, "peso": pr.peso, "repeticiones": pr.repeticiones, "fecha": pr.fecha} for pr in prs],
        "rutinas": [r for r in alumno.rutinas if not r.eliminado],
        "dietas": [d for d in alumno.dietas if not d.eliminado]
    }