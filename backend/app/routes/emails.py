from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.models import Coach, Alumno
from app.middleware.auth import get_current_coach
import resend
import os

# Configurar Resend solo si hay API key
if os.getenv("RESEND_API_KEY"):
    resend.api_key = os.getenv("RESEND_API_KEY")
else:
    print("Warning: RESEND_API_KEY not configured")

router = APIRouter(prefix="/emails", tags=["emails"])

class QuotaIncreaseRequest(BaseModel):
    alumno_ids: List[int]
    new_amount: float
    message: str = ""

class AbsenceNoticeRequest(BaseModel):
    alumno_ids: List[int]
    start_date: str
    end_date: str
    reason: str
    message: str = ""

@router.post("/quota-increase")
def send_quota_increase(request: QuotaIncreaseRequest, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    if not os.getenv("RESEND_API_KEY"):
        raise HTTPException(status_code=400, detail="Email service not configured")
    
    try:
        alumnos = db.query(Alumno).filter(
            Alumno.id.in_(request.alumno_ids),
            Alumno.coach_id == coach.id
        ).all()
        
        if not alumnos:
            raise HTTPException(status_code=404, detail="No alumnos found")
        
        sent_count = 0
        for alumno in alumnos:
            try:
                html_content = f"""
                <h2>Actualización de Cuota - {coach.nombre}</h2>
                <p>Hola {alumno.nombre},</p>
                <p>Te informamos que a partir del próximo mes, la cuota será de <strong>${request.new_amount}</strong>.</p>
                {f'<p>{request.message}</p>' if request.message else ''}
                <p>Gracias por tu comprensión.</p>
                <p>Saludos,<br>{coach.nombre}</p>
                """
                
                resend.Emails.send({
                    "from": os.getenv("FROM_EMAIL", "noreply@fittracker.com"),
                    "to": alumno.email,
                    "subject": f"Actualización de Cuota - {coach.nombre}",
                    "html": html_content
                })
                sent_count += 1
            except Exception as e:
                print(f"Error sending email to {alumno.email}: {e}")
                continue
        
        return {"message": f"Emails enviados exitosamente a {sent_count} alumnos"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending emails: {str(e)}")

@router.post("/absence-notice")
def send_absence_notice(request: AbsenceNoticeRequest, coach: Coach = Depends(get_current_coach), db: Session = Depends(get_db)):
    if not os.getenv("RESEND_API_KEY"):
        raise HTTPException(status_code=400, detail="Email service not configured")
    
    try:
        alumnos = db.query(Alumno).filter(
            Alumno.id.in_(request.alumno_ids),
            Alumno.coach_id == coach.id
        ).all()
        
        if not alumnos:
            raise HTTPException(status_code=404, detail="No alumnos found")
        
        sent_count = 0
        for alumno in alumnos:
            try:
                html_content = f"""
                <h2>Aviso de Ausencia - {coach.nombre}</h2>
                <p>Hola {alumno.nombre},</p>
                <p>Te informamos que estaré ausente desde el <strong>{request.start_date}</strong> hasta el <strong>{request.end_date}</strong>.</p>
                <p><strong>Motivo:</strong> {request.reason}</p>
                {f'<p>{request.message}</p>' if request.message else ''}
                <p>Durante este período no habrá entrenamientos. Nos pondremos en contacto para reprogramar.</p>
                <p>Gracias por tu comprensión.</p>
                <p>Saludos,<br>{coach.nombre}</p>
                """
                
                resend.Emails.send({
                    "from": os.getenv("FROM_EMAIL", "noreply@fittracker.com"),
                    "to": alumno.email,
                    "subject": f"Aviso de Ausencia - {coach.nombre}",
                    "html": html_content
                })
                sent_count += 1
            except Exception as e:
                print(f"Error sending email to {alumno.email}: {e}")
                continue
        
        return {"message": f"Emails enviados exitosamente a {sent_count} alumnos"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending emails: {str(e)}")