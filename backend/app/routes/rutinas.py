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
    notas: Optional[str] = None
    entrenamientos_semana: Optional[int] = 3

class RutinaUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    notas: Optional[str] = None
    entrenamientos_semana: Optional[int] = None
    activa: Optional[bool] = None

class EjercicioCreate(BaseModel):
    ejercicio_base_id: int
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
def create_rutina(alumno_id: int, rutina_data: RutinaCreate, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id, Alumno.coach_id == coach.id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno not found")
    
    # Marcar rutina anterior como eliminada si existe
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