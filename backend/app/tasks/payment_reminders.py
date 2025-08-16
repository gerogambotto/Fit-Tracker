from datetime import datetime, timedelta, timezone
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.database import SessionLocal
from app.models.models import Alumno, Coach
from app.utils.email_service import send_payment_reminder
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_payment_reminders():
    """Verificar y enviar recordatorios de pago"""
    db = SessionLocal()
    
    try:
        today = datetime.now(timezone.utc)
        hace_30_dias = today - timedelta(days=30)
        
        # Buscar alumnos que necesitan notificación
        alumnos_a_cobrar = db.query(Alumno).join(Coach).filter(
            Alumno.fecha_cobro.isnot(None),
            Alumno.notificaciones_activas == True,
            Alumno.fecha_cobro <= today,
            # No notificado en los últimos 30 días
            (Alumno.ultima_notificacion.is_(None)) | 
            (Alumno.ultima_notificacion <= hace_30_dias)
        ).all()
        
        emails_enviados = 0
        alumnos_actualizados = []
        
        for alumno in alumnos_a_cobrar:
            try:
                success = send_payment_reminder(
                    alumno_email=alumno.email,
                    alumno_nombre=alumno.nombre,
                    coach_nombre=alumno.coach.nombre
                )
                
                if success:
                    emails_enviados += 1
                    # Marcar como notificado
                    alumno.ultima_notificacion = today
                    alumnos_actualizados.append(alumno)
                    
            except Exception as email_error:
                logger.error(f"Error sending email to {alumno.email}: {str(email_error)}")
                continue
        
        # Batch commit all updates
        if alumnos_actualizados:
            db.commit()
            
        logger.info(f"Recordatorios enviados: {emails_enviados}")
        
    except SQLAlchemyError as db_error:
        logger.error(f"Database error in check_payment_reminders: {str(db_error)}")
        db.rollback()
    except Exception as e:
        logger.error(f"Unexpected error in check_payment_reminders: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    check_payment_reminders()