from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("coaches.id"))
    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=True)
    tipo = Column(String(50))  # rutina_vencida, dieta_vencida, meet_seguimiento
    titulo = Column(String(200))
    mensaje = Column(Text)
    leida = Column(Boolean, default=False)
    creada_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    coach = relationship("Coach")
    alumno = relationship("Alumno")

class Lesion(Base):
    __tablename__ = "lesiones"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    nombre = Column(String(100))
    descripcion = Column(Text)
    es_cronica = Column(Boolean, default=False)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime, nullable=True)
    activa = Column(Boolean, default=True)
    creada_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    alumno = relationship("Alumno")