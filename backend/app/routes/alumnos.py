from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.models import Coach, Alumno, PesoAlumno
from app.middleware.auth import get_current_coach

router = APIRouter(prefix="/alumnos", tags=["alumnos"])

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

@router.get("/")
def get_alumnos(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumnos = db.query(Alumno).filter(Alumno.coach_id == coach.id).all()
    return alumnos

@router.post("/")
def create_alumno(alumno_data: AlumnoCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
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

@router.get("/{alumno_id}")
def get_alumno(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    return alumno

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
        fecha=peso_data.fecha or datetime.utcnow()
    )
    
    db.add(new_peso)
    db.commit()
    db.refresh(new_peso)
    
    return new_peso

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
        today = datetime.utcnow().date()
        birth_date = alumno.fecha_nacimiento.date()
        edad = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
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
        "rutinas": [r for r in alumno.rutinas if not r.eliminado]
    }