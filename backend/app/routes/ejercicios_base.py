from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models.models import EjercicioBase
from app.middleware.auth import get_current_coach

router = APIRouter(prefix="/ejercicios-base", tags=["ejercicios-base"])

class EjercicioBaseCreate(BaseModel):
    nombre: str
    categoria: str

@router.get("/")
def get_ejercicios_base(db: Session = Depends(get_db)):
    ejercicios = db.query(EjercicioBase).order_by(EjercicioBase.categoria, EjercicioBase.nombre).all()
    return ejercicios

@router.get("/search/{query}")
def search_ejercicios(query: str, db: Session = Depends(get_db)):
    ejercicios = db.query(EjercicioBase).filter(
        EjercicioBase.nombre.ilike(f"%{query}%")
    ).limit(10).all()
    return ejercicios

@router.post("/")
def create_ejercicio_base(ejercicio_data: EjercicioBaseCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existing = db.query(EjercicioBase).filter(EjercicioBase.nombre.ilike(ejercicio_data.nombre)).first()
    if existing:
        return existing
    
    new_ejercicio = EjercicioBase(
        nombre=ejercicio_data.nombre,
        categoria=ejercicio_data.categoria
    )
    
    db.add(new_ejercicio)
    db.commit()
    db.refresh(new_ejercicio)
    
    return new_ejercicio