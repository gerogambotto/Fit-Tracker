from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.models import Coach, Alumno, Dieta, Comida, ComidaAlimento, Alimento, DietaPlantilla, ComidaPlantilla, ComidaPlantillaAlimento
from app.middleware.auth import get_current_coach

router = APIRouter(tags=["dietas"])

class DietaCreate(BaseModel):
    nombre: str
    fecha_inicio: Optional[datetime] = None
    notas: Optional[str] = None

class ComidaCreate(BaseModel):
    nombre: str
    orden: int = 1

class ComidaUpdate(BaseModel):
    nombre: Optional[str] = None
    orden: Optional[int] = None

class ComidaAlimentoCreate(BaseModel):
    alimento_id: int
    cantidad_gramos: float

@router.get("/alumnos/{alumno_id}/dietas")
def get_dietas(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    dietas = db.query(Dieta).options(
        joinedload(Dieta.comidas).joinedload(Comida.alimentos).joinedload(ComidaAlimento.alimento)
    ).filter(
        Dieta.alumno_id == alumno_id,
        Dieta.eliminado == False
    ).order_by(Dieta.activa.desc(), Dieta.id.desc()).all()
    return dietas

@router.post("/alumnos/{alumno_id}/dietas")
def create_dieta(alumno_id: int, dieta_data: DietaCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    # Marcar dieta anterior como eliminada
    dieta_anterior = db.query(Dieta).filter(
        Dieta.alumno_id == alumno_id,
        Dieta.activa == True,
        Dieta.eliminado == False
    ).first()
    if dieta_anterior:
        dieta_anterior.eliminado = True
        dieta_anterior.activa = False
    
    new_dieta = Dieta(
        alumno_id=alumno_id,
        nombre=dieta_data.nombre,
        fecha_inicio=dieta_data.fecha_inicio,
        notas=dieta_data.notas
    )
    
    db.add(new_dieta)
    db.commit()
    db.refresh(new_dieta)
    return new_dieta

@router.get("/dietas/{dieta_id}")
def get_dieta(dieta_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    dieta = db.query(Dieta).options(
        joinedload(Dieta.comidas).joinedload(Comida.alimentos).joinedload(ComidaAlimento.alimento),
        joinedload(Dieta.alumno)
    ).join(Alumno).filter(
        Dieta.id == dieta_id,
        Alumno.coach_id == coach.id,
        Dieta.eliminado == False
    ).first()
    
    if not dieta:
        raise HTTPException(status_code=404, detail="Dieta not found")
    
    return dieta

@router.post("/dietas/{dieta_id}/comidas")
def add_comida(dieta_id: int, comida_data: ComidaCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    dieta = db.query(Dieta).join(Alumno).filter(
        Dieta.id == dieta_id,
        Alumno.coach_id == coach.id,
        Dieta.eliminado == False
    ).first()
    
    if not dieta:
        raise HTTPException(status_code=404, detail="Dieta not found")
    
    new_comida = Comida(
        dieta_id=dieta_id,
        nombre=comida_data.nombre,
        orden=comida_data.orden
    )
    
    db.add(new_comida)
    db.commit()
    db.refresh(new_comida)
    return new_comida

@router.post("/comidas/{comida_id}/alimentos")
def add_alimento_to_comida(comida_id: int, alimento_data: ComidaAlimentoCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    comida = db.query(Comida).join(Dieta).join(Alumno).filter(
        Comida.id == comida_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not comida:
        raise HTTPException(status_code=404, detail="Comida not found")
    
    new_comida_alimento = ComidaAlimento(
        comida_id=comida_id,
        alimento_id=alimento_data.alimento_id,
        cantidad_gramos=alimento_data.cantidad_gramos
    )
    
    db.add(new_comida_alimento)
    db.commit()
    db.refresh(new_comida_alimento)
    return new_comida_alimento

@router.delete("/comida-alimentos/{comida_alimento_id}")
def delete_comida_alimento(comida_alimento_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    comida_alimento = db.query(ComidaAlimento).join(Comida).join(Dieta).join(Alumno).filter(
        ComidaAlimento.id == comida_alimento_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not comida_alimento:
        raise HTTPException(status_code=404, detail="Comida alimento not found")
    
    db.delete(comida_alimento)
    db.commit()
    return {"message": "Alimento removed from comida"}

@router.patch("/comidas/{comida_id}")
def update_comida(comida_id: int, comida_data: ComidaUpdate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    comida = db.query(Comida).join(Dieta).join(Alumno).filter(
        Comida.id == comida_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not comida:
        raise HTTPException(status_code=404, detail="Comida not found")
    
    for field, value in comida_data.dict(exclude_unset=True).items():
        setattr(comida, field, value)
    
    db.commit()
    db.refresh(comida)
    return comida

@router.delete("/comidas/{comida_id}")
def delete_comida(comida_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    comida = db.query(Comida).join(Dieta).join(Alumno).filter(
        Comida.id == comida_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not comida:
        raise HTTPException(status_code=404, detail="Comida not found")
    
    db.delete(comida)
    db.commit()
    return {"message": "Comida deleted successfully"}

@router.get("/dietas-plantillas")
def get_dietas_plantillas(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    plantillas = db.query(DietaPlantilla).options(
        joinedload(DietaPlantilla.comidas).joinedload(ComidaPlantilla.alimentos).joinedload(ComidaPlantillaAlimento.alimento)
    ).filter(DietaPlantilla.coach_id == coach.id).all()
    return plantillas

@router.post("/dietas/{dieta_id}/save-as-template")
def save_dieta_as_template(dieta_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    dieta = db.query(Dieta).options(
        joinedload(Dieta.comidas).joinedload(Comida.alimentos).joinedload(ComidaAlimento.alimento)
    ).join(Alumno).filter(
        Dieta.id == dieta_id,
        Alumno.coach_id == coach.id,
        Dieta.eliminado == False
    ).first()
    
    if not dieta:
        raise HTTPException(status_code=404, detail="Dieta not found")
    
    # Crear plantilla
    plantilla = DietaPlantilla(
        coach_id=coach.id,
        nombre=f"{dieta.nombre} (Plantilla)",
        notas=dieta.notas
    )
    
    db.add(plantilla)
    db.commit()
    db.refresh(plantilla)
    
    # Copiar comidas
    for comida in dieta.comidas:
        comida_plantilla = ComidaPlantilla(
            dieta_plantilla_id=plantilla.id,
            nombre=comida.nombre,
            orden=comida.orden
        )
        db.add(comida_plantilla)
        db.commit()
        db.refresh(comida_plantilla)
        
        # Copiar alimentos
        for comida_alimento in comida.alimentos:
            alimento_plantilla = ComidaPlantillaAlimento(
                comida_plantilla_id=comida_plantilla.id,
                alimento_id=comida_alimento.alimento_id,
                cantidad_gramos=comida_alimento.cantidad_gramos
            )
            db.add(alimento_plantilla)
    
    db.commit()
    return plantilla

@router.post("/dietas-plantillas/{plantilla_id}/create-dieta/{alumno_id}")
def create_dieta_from_template(plantilla_id: int, alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    # Verificar plantilla
    plantilla = db.query(DietaPlantilla).options(
        joinedload(DietaPlantilla.comidas).joinedload(ComidaPlantilla.alimentos).joinedload(ComidaPlantillaAlimento.alimento)
    ).filter(
        DietaPlantilla.id == plantilla_id,
        DietaPlantilla.coach_id == coach.id
    ).first()
    
    if not plantilla:
        raise HTTPException(status_code=404, detail="Plantilla not found")
    
    # Verificar alumno
    alumno = db.query(Alumno).filter(
        Alumno.id == alumno_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    # Marcar dieta anterior como eliminada
    dieta_anterior = db.query(Dieta).filter(
        Dieta.alumno_id == alumno_id,
        Dieta.activa == True,
        Dieta.eliminado == False
    ).first()
    if dieta_anterior:
        dieta_anterior.eliminado = True
        dieta_anterior.activa = False
    
    # Crear dieta desde plantilla
    nueva_dieta = Dieta(
        alumno_id=alumno_id,
        nombre=plantilla.nombre.replace(" (Plantilla)", ""),
        notas=plantilla.notas
    )
    
    db.add(nueva_dieta)
    db.commit()
    db.refresh(nueva_dieta)
    
    # Copiar comidas
    for comida_plantilla in plantilla.comidas:
        nueva_comida = Comida(
            dieta_id=nueva_dieta.id,
            nombre=comida_plantilla.nombre,
            orden=comida_plantilla.orden
        )
        db.add(nueva_comida)
        db.commit()
        db.refresh(nueva_comida)
        
        # Copiar alimentos
        for alimento_plantilla in comida_plantilla.alimentos:
            nuevo_comida_alimento = ComidaAlimento(
                comida_id=nueva_comida.id,
                alimento_id=alimento_plantilla.alimento_id,
                cantidad_gramos=alimento_plantilla.cantidad_gramos
            )
            db.add(nuevo_comida_alimento)
    
    db.commit()
    return nueva_dieta

@router.get("/alimentos")
def get_alimentos(db: Session = Depends(get_db)):
    alimentos = db.query(Alimento).all()
    return alimentos

@router.get("/alimentos/search/{query}")
def search_alimentos(query: str, db: Session = Depends(get_db)):
    alimentos = db.query(Alimento).filter(
        Alimento.nombre.ilike(f"%{query}%")
    ).limit(20).all()
    return alimentos

class AlimentoCreate(BaseModel):
    nombre: str
    calorias_100g: float
    proteinas_100g: float
    carbohidratos_100g: float
    grasas_100g: float

@router.post("/alimentos")
def create_alimento(alimento_data: AlimentoCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existing = db.query(Alimento).filter(Alimento.nombre.ilike(alimento_data.nombre)).first()
    if existing:
        return existing
    
    new_alimento = Alimento(
        nombre=alimento_data.nombre,
        calorias_100g=alimento_data.calorias_100g,
        proteinas_100g=alimento_data.proteinas_100g,
        carbohidratos_100g=alimento_data.carbohidratos_100g,
        grasas_100g=alimento_data.grasas_100g
    )
    
    db.add(new_alimento)
    db.commit()
    db.refresh(new_alimento)
    return new_alimento