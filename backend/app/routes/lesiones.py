from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.models import Coach, Alumno, Lesion
from app.middleware.auth import get_current_coach

router = APIRouter(prefix="/lesiones", tags=["lesiones"])

class LesionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    es_cronica: bool = False
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None

class LesionUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    es_cronica: Optional[bool] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    activa: Optional[bool] = None

@router.get("/alumno/{alumno_id}")
def get_lesiones_by_alumno(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    lesiones = db.query(Lesion).filter(Lesion.alumno_id == alumno_id).all()
    return lesiones

@router.post("/alumno/{alumno_id}")
def create_lesion(alumno_id: int, lesion_data: LesionCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    lesion = Lesion(
        alumno_id=alumno_id,
        nombre=lesion_data.nombre,
        descripcion=lesion_data.descripcion,
        es_cronica=lesion_data.es_cronica,
        fecha_inicio=lesion_data.fecha_inicio,
        fecha_fin=lesion_data.fecha_fin
    )
    
    db.add(lesion)
    db.commit()
    db.refresh(lesion)
    return lesion

@router.patch("/{lesion_id}")
def update_lesion(lesion_id: int, lesion_data: LesionUpdate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    lesion = db.query(Lesion).join(Alumno).filter(
        Lesion.id == lesion_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not lesion:
        raise HTTPException(status_code=404, detail="Lesion not found")
    
    for field, value in lesion_data.dict(exclude_unset=True).items():
        setattr(lesion, field, value)
    
    db.commit()
    db.refresh(lesion)
    return lesion

@router.delete("/{lesion_id}")
def delete_lesion(lesion_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    lesion = db.query(Lesion).join(Alumno).filter(
        Lesion.id == lesion_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not lesion:
        raise HTTPException(status_code=404, detail="Lesion not found")
    
    db.delete(lesion)
    db.commit()
    return {"message": "Lesion deleted successfully"}