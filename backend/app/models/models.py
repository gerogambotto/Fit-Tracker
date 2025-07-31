from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Coach(Base):
    __tablename__ = "coaches"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100))
    email = Column(String(100), unique=True)
    password_hash = Column(String(255))
    creado_en = Column(DateTime, default=datetime.utcnow)
    
    alumnos = relationship("Alumno", back_populates="coach")

class Alumno(Base):
    __tablename__ = "alumnos"
    
    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("coaches.id"))
    nombre = Column(String(100))
    email = Column(String(100))
    fecha_nacimiento = Column(DateTime)
    altura = Column(Float)  # en metros
    objetivo = Column(String(255))
    fecha_cobro = Column(DateTime, nullable=True)
    notificaciones_activas = Column(Boolean, default=True)
    ultima_notificacion = Column(DateTime, nullable=True)
    creado_en = Column(DateTime, default=datetime.utcnow)
    
    coach = relationship("Coach", back_populates="alumnos")
    pesos = relationship("PesoAlumno", back_populates="alumno")
    rutinas = relationship("Rutina", back_populates="alumno")

class PesoAlumno(Base):
    __tablename__ = "pesos_alumno"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    peso = Column(Float)
    fecha = Column(DateTime, default=datetime.utcnow)
    
    alumno = relationship("Alumno", back_populates="pesos")

class Rutina(Base):
    __tablename__ = "rutinas"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    nombre = Column(String(100))
    fecha_inicio = Column(DateTime)
    notas = Column(Text)
    entrenamientos_semana = Column(Integer, default=3)
    activa = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False)
    
    alumno = relationship("Alumno", back_populates="rutinas")
    ejercicios = relationship("Ejercicio", back_populates="rutina")

class EjercicioBase(Base):
    __tablename__ = "ejercicios_base"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), unique=True)
    categoria = Column(String(50))  # grupo muscular
    creado_en = Column(DateTime, default=datetime.utcnow)

class Ejercicio(Base):
    __tablename__ = "ejercicios"
    
    id = Column(Integer, primary_key=True)
    rutina_id = Column(Integer, ForeignKey("rutinas.id"))
    ejercicio_base_id = Column(Integer, ForeignKey("ejercicios_base.id"))
    series = Column(Integer)
    repeticiones = Column(Integer)
    peso = Column(Float, nullable=True)  # en kg
    descanso = Column(Integer)
    notas = Column(Text, nullable=True)
    
    rutina = relationship("Rutina", back_populates="ejercicios")
    ejercicio_base = relationship("EjercicioBase")