from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.models import Coach, Alumno, Rutina, Ejercicio, PesoAlumno, RutinaPlantilla, EjercicioPlantilla
from app.middleware.auth import get_current_coach
from app.utils.pdf_generator import generate_rutina_pdf
from app.utils.excel_generator import generate_rutina_excel

router = APIRouter(tags=["rutinas"])

class RutinaCreate(BaseModel):
    nombre: str
    fecha_inicio: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    notas: Optional[str] = None
    entrenamientos_semana: Optional[int] = 3

class RutinaUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    notas: Optional[str] = None
    entrenamientos_semana: Optional[int] = None
    activa: Optional[bool] = None

class EjercicioCreate(BaseModel):
    ejercicio_base_id: int
    dia: int = 1
    series: int
    repeticiones: int
    peso: Optional[float] = None
    descanso: int
    notas: Optional[str] = None

class EjercicioUpdate(BaseModel):
    nombre: Optional[str] = None
    series: Optional[int] = None
    repeticiones: Optional[int] = None
    peso: Optional[float] = None
    descanso: Optional[int] = None
    notas: Optional[str] = None

class PesoUpdate(BaseModel):
    peso: float
    fecha: Optional[datetime] = None

@router.get("/alumnos/{alumno_id}/rutinas")
def get_rutinas(alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    rutinas = db.query(Rutina).options(
        joinedload(Rutina.ejercicios).joinedload(Ejercicio.ejercicio_base)
    ).filter(
        Rutina.alumno_id == alumno_id,
        Rutina.eliminado == False
    ).order_by(Rutina.activa.desc(), Rutina.id.desc()).all()
    return rutinas

@router.post("/alumnos/{alumno_id}/rutinas")
def create_rutina(alumno_id: str, rutina_data: RutinaCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    # Handle standalone routines (alumno_id can be 'none')
    if alumno_id != 'none':
        alumno_id = int(alumno_id)
        alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
        if not alumno:
            raise HTTPException(status_code=404, detail="Alumno not found")
    else:
        alumno_id = None
    
    # Marcar rutina anterior como eliminada si existe (only for assigned routines)
    if alumno_id:
        rutina_anterior = db.query(Rutina).filter(
            Rutina.alumno_id == alumno_id,
            Rutina.activa == True,
            Rutina.eliminado == False
        ).first()
        if rutina_anterior:
            rutina_anterior.eliminado = True
            rutina_anterior.activa = False
    
    new_rutina = Rutina(
        alumno_id=alumno_id,
        nombre=rutina_data.nombre,
        fecha_inicio=rutina_data.fecha_inicio,
        fecha_vencimiento=rutina_data.fecha_vencimiento,
        notas=rutina_data.notas,
        entrenamientos_semana=rutina_data.entrenamientos_semana
    )
    
    db.add(new_rutina)
    db.commit()
    db.refresh(new_rutina)
    
    return new_rutina

@router.get("/rutinas/{rutina_id}")
def get_rutina(rutina_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    
    rutina = db.query(Rutina).options(
        joinedload(Rutina.ejercicios).joinedload(Ejercicio.ejercicio_base),
        joinedload(Rutina.alumno)
    ).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    return rutina

@router.patch("/rutinas/{rutina_id}")
def update_rutina(rutina_id: int, rutina_data: RutinaUpdate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    rutina = db.query(Rutina).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    for field, value in rutina_data.dict(exclude_unset=True).items():
        setattr(rutina, field, value)
    
    db.commit()
    db.refresh(rutina)
    return rutina

@router.delete("/rutinas/{rutina_id}")
def delete_rutina(rutina_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    rutina = db.query(Rutina).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    rutina.eliminado = True
    rutina.activa = False
    db.commit()
    return {"message": "Rutina deleted successfully"}

@router.post("/rutinas/{rutina_id}/ejercicios")
def add_ejercicio(rutina_id: int, ejercicio_data: EjercicioCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    rutina = db.query(Rutina).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    new_ejercicio = Ejercicio(
        rutina_id=rutina_id,
        ejercicio_base_id=ejercicio_data.ejercicio_base_id,
        dia=ejercicio_data.dia,
        series=ejercicio_data.series,
        repeticiones=ejercicio_data.repeticiones,
        peso=ejercicio_data.peso,
        descanso=ejercicio_data.descanso,
        notas=ejercicio_data.notas
    )
    
    db.add(new_ejercicio)
    db.commit()
    db.refresh(new_ejercicio)
    
    return new_ejercicio

@router.patch("/ejercicios/{ejercicio_id}")
def update_ejercicio(ejercicio_id: int, ejercicio_data: EjercicioUpdate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    ejercicio = db.query(Ejercicio).join(Rutina).join(Alumno).filter(
        Ejercicio.id == ejercicio_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not ejercicio:
        raise HTTPException(status_code=404, detail="Ejercicio not found")
    
    for field, value in ejercicio_data.dict(exclude_unset=True).items():
        setattr(ejercicio, field, value)
    
    db.commit()
    db.refresh(ejercicio)
    return ejercicio

@router.delete("/ejercicios/{ejercicio_id}")
def delete_ejercicio(ejercicio_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    ejercicio = db.query(Ejercicio).join(Rutina).join(Alumno).filter(
        Ejercicio.id == ejercicio_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not ejercicio:
        raise HTTPException(status_code=404, detail="Ejercicio not found")
    
    db.delete(ejercicio)
    db.commit()
    return {"message": "Ejercicio deleted successfully"}

@router.patch("/pesos/{peso_id}")
def update_peso(peso_id: int, peso_data: PesoUpdate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    peso = db.query(PesoAlumno).join(Alumno).filter(
        PesoAlumno.id == peso_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not peso:
        raise HTTPException(status_code=404, detail="Peso not found")
    
    peso.peso = peso_data.peso
    if peso_data.fecha:
        peso.fecha = peso_data.fecha
    
    db.commit()
    db.refresh(peso)
    return peso

@router.delete("/pesos/{peso_id}")
def delete_peso(peso_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    peso = db.query(PesoAlumno).join(Alumno).filter(
        PesoAlumno.id == peso_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not peso:
        raise HTTPException(status_code=404, detail="Peso not found")
    
    db.delete(peso)
    db.commit()
    return {"message": "Peso deleted successfully"}

@router.get("/rutinas/{rutina_id}/pdf")
def download_rutina_pdf(rutina_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    rutina = db.query(Rutina).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    pdf_content = generate_rutina_pdf(rutina)
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=rutina_{rutina.nombre}.pdf"}
    )

@router.get("/rutinas/{rutina_id}/excel")
def download_rutina_excel(rutina_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    rutina = db.query(Rutina).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    excel_content = generate_rutina_excel(rutina)
    
    return Response(
        content=excel_content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=rutina_{rutina.nombre}.xlsx"}
    )

@router.post("/rutinas/{rutina_id}/copy/{target_alumno_id}")
def copy_rutina(rutina_id: int, target_alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    
    # Verificar rutina original
    rutina_original = db.query(Rutina).options(
        joinedload(Rutina.ejercicios).joinedload(Ejercicio.ejercicio_base)
    ).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina_original:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    # Verificar alumno destino
    target_alumno = db.query(Alumno).filter(
        Alumno.id == target_alumno_id,
        Alumno.coach_id == coach.id
    ).first()
    
    if not target_alumno:
        raise HTTPException(status_code=404, detail="Target alumno not found")
    
    # Marcar rutina anterior como eliminada si existe
    rutina_anterior = db.query(Rutina).filter(
        Rutina.alumno_id == target_alumno_id,
        Rutina.activa == True,
        Rutina.eliminado == False
    ).first()
    if rutina_anterior:
        rutina_anterior.eliminado = True
        rutina_anterior.activa = False
    
    # Crear nueva rutina
    nueva_rutina = Rutina(
        alumno_id=target_alumno_id,
        nombre=f"{rutina_original.nombre}",
        fecha_inicio=rutina_original.fecha_inicio,
        notas=rutina_original.notas,
        entrenamientos_semana=rutina_original.entrenamientos_semana
    )
    
    db.add(nueva_rutina)
    db.commit()
    db.refresh(nueva_rutina)
    
    # Copiar ejercicios
    for ejercicio_original in rutina_original.ejercicios:
        nuevo_ejercicio = Ejercicio(
            rutina_id=nueva_rutina.id,
            ejercicio_base_id=ejercicio_original.ejercicio_base_id,
            series=ejercicio_original.series,
            repeticiones=ejercicio_original.repeticiones,
            peso=ejercicio_original.peso,
            descanso=ejercicio_original.descanso,
            notas=ejercicio_original.notas
        )
        db.add(nuevo_ejercicio)
    
    db.commit()
    return nueva_rutina

class CopyDayRequest(BaseModel):
    source_day: int
    target_day: int

@router.post("/rutinas/{rutina_id}/copy-day")
def copy_day_exercises(rutina_id: int, copy_data: CopyDayRequest, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    """Copy all exercises from one day to another within the same routine"""
    from sqlalchemy.orm import joinedload
    from sqlalchemy.exc import SQLAlchemyError
    
    # Verify routine exists and belongs to coach
    rutina = db.query(Rutina).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    # Validate day numbers
    if not (1 <= copy_data.source_day <= 7) or not (1 <= copy_data.target_day <= 7):
        raise HTTPException(status_code=400, detail="Day must be between 1 and 7")
    
    if copy_data.source_day == copy_data.target_day:
        raise HTTPException(status_code=400, detail="Source and target day cannot be the same")
    
    try:
        # Get exercises from source day
        source_exercises = db.query(Ejercicio).options(
            joinedload(Ejercicio.ejercicio_base)
        ).filter(
            Ejercicio.rutina_id == rutina_id,
            Ejercicio.dia == copy_data.source_day
        ).all()
        
        if not source_exercises:
            raise HTTPException(status_code=404, detail=f"No exercises found for day {copy_data.source_day}")
        
        # Delete existing exercises in target day
        db.query(Ejercicio).filter(
            Ejercicio.rutina_id == rutina_id,
            Ejercicio.dia == copy_data.target_day
        ).delete()
        
        # Copy exercises to target day
        copied_exercises = []
        for exercise in source_exercises:
            new_exercise = Ejercicio(
                rutina_id=rutina_id,
                ejercicio_base_id=exercise.ejercicio_base_id,
                dia=copy_data.target_day,
                series=exercise.series,
                repeticiones=exercise.repeticiones,
                peso=exercise.peso,
                descanso=exercise.descanso,
                notas=exercise.notas
            )
            db.add(new_exercise)
            copied_exercises.append(new_exercise)
        
        db.commit()
        
        return {
            "message": f"Copied {len(copied_exercises)} exercises from day {copy_data.source_day} to day {copy_data.target_day}",
            "exercises_copied": len(copied_exercises)
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error copying exercises")

@router.get("/plantillas")
def get_plantillas(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    
    plantillas = db.query(RutinaPlantilla).options(
        joinedload(RutinaPlantilla.ejercicios).joinedload(EjercicioPlantilla.ejercicio_base)
    ).filter(RutinaPlantilla.coach_id == coach.id).all()
    return plantillas

@router.post("/plantillas")
def create_plantilla(plantilla_data: RutinaCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    nueva_plantilla = RutinaPlantilla(
        coach_id=coach.id,
        nombre=plantilla_data.nombre,
        notas=plantilla_data.notas,
        entrenamientos_semana=plantilla_data.entrenamientos_semana
    )
    
    db.add(nueva_plantilla)
    db.commit()
    db.refresh(nueva_plantilla)
    return nueva_plantilla

@router.post("/rutinas/{rutina_id}/save-as-template")
def save_as_template(rutina_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    
    rutina = db.query(Rutina).options(
        joinedload(Rutina.ejercicios).joinedload(Ejercicio.ejercicio_base)
    ).join(Alumno).filter(
        Rutina.id == rutina_id,
        Alumno.coach_id == coach.id,
        Rutina.eliminado == False
    ).first()
    
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")
    
    # Crear plantilla
    plantilla = RutinaPlantilla(
        coach_id=coach.id,
        nombre=f"{rutina.nombre} (Plantilla)",
        notas=rutina.notas,
        entrenamientos_semana=rutina.entrenamientos_semana
    )
    
    db.add(plantilla)
    db.commit()
    db.refresh(plantilla)
    
    # Copiar ejercicios
    for ejercicio in rutina.ejercicios:
        ejercicio_plantilla = EjercicioPlantilla(
            rutina_plantilla_id=plantilla.id,
            ejercicio_base_id=ejercicio.ejercicio_base_id,
            series=ejercicio.series,
            repeticiones=ejercicio.repeticiones,
            peso=ejercicio.peso,
            descanso=ejercicio.descanso,
            notas=ejercicio.notas
        )
        db.add(ejercicio_plantilla)
    
    db.commit()
    return plantilla

@router.post("/plantillas/{plantilla_id}/create-rutina/{alumno_id}")
def create_from_template(plantilla_id: int, alumno_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    
    # Verificar plantilla
    plantilla = db.query(RutinaPlantilla).options(
        joinedload(RutinaPlantilla.ejercicios).joinedload(EjercicioPlantilla.ejercicio_base)
    ).filter(
        RutinaPlantilla.id == plantilla_id,
        RutinaPlantilla.coach_id == coach.id
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
    
    # Marcar rutina anterior como eliminada
    rutina_anterior = db.query(Rutina).filter(
        Rutina.alumno_id == alumno_id,
        Rutina.activa == True,
        Rutina.eliminado == False
    ).first()
    if rutina_anterior:
        rutina_anterior.eliminado = True
        rutina_anterior.activa = False
    
    # Crear rutina desde plantilla
    nueva_rutina = Rutina(
        alumno_id=alumno_id,
        nombre=plantilla.nombre.replace(" (Plantilla)", ""),
        notas=plantilla.notas,
        entrenamientos_semana=plantilla.entrenamientos_semana
    )
    
    db.add(nueva_rutina)
    db.commit()
    db.refresh(nueva_rutina)
    
    # Copiar ejercicios
    for ejercicio_plantilla in plantilla.ejercicios:
        nuevo_ejercicio = Ejercicio(
            rutina_id=nueva_rutina.id,
            ejercicio_base_id=ejercicio_plantilla.ejercicio_base_id,
            series=ejercicio_plantilla.series,
            repeticiones=ejercicio_plantilla.repeticiones,
            peso=ejercicio_plantilla.peso,
            descanso=ejercicio_plantilla.descanso,
            notas=ejercicio_plantilla.notas
        )
        db.add(nuevo_ejercicio)
    
    db.commit()
    return nueva_rutina