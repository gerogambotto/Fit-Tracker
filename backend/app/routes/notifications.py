from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import Coach, Alumno, Notification, Rutina, Dieta
from app.middleware.auth import get_current_coach

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
def get_notifications(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    notifications = db.query(Notification).options(
        joinedload(Notification.alumno)
    ).filter(
        Notification.coach_id == coach.id
    ).order_by(Notification.creada_en.desc()).all()
    return notifications

@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.coach_id == coach.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.leida = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.coach_id == coach.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted"}

@router.get("/unread-count")
def get_unread_count(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    count = db.query(Notification).filter(
        Notification.coach_id == coach.id,
        Notification.leida == False
    ).count()
    return {"count": count}

@router.post("/generate-test")
def generate_test_notifications(coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    # Crear notificaciones de prueba
    test_notifications = [
        Notification(
            coach_id=coach.id,
            tipo="rutina_vencida",
            titulo="Rutina Vencida",
            mensaje="La rutina de Juan Pérez ha vencido y necesita ser actualizada."
        ),
        Notification(
            coach_id=coach.id,
            tipo="dieta_vencida", 
            titulo="Dieta Vencida",
            mensaje="La dieta de María García ha vencido y necesita ser renovada."
        ),
        Notification(
            coach_id=coach.id,
            tipo="meet_seguimiento",
            titulo="Meet de Seguimiento",
            mensaje="Es hora de programar una sesión de seguimiento con Pedro López."
        )
    ]
    
    for notification in test_notifications:
        db.add(notification)
    
    db.commit()
    return {"message": "Test notifications created"}