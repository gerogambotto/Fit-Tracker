from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Coach(Base):
    __tablename__ = "coaches"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100))
    email = Column(String(100), unique=True)
    password_hash = Column(String(255))
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
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
    notificaciones_activas = Column(Boolean, default=False)
    ultima_notificacion = Column(DateTime, nullable=True)
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    coach = relationship("Coach", back_populates="alumnos")
    pesos = relationship("PesoAlumno", back_populates="alumno")
    rutinas = relationship("Rutina", back_populates="alumno")
    personal_records = relationship("PersonalRecord", back_populates="alumno")
    dietas = relationship("Dieta", back_populates="alumno")

class PesoAlumno(Base):
    __tablename__ = "pesos_alumno"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    peso = Column(Float)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    alumno = relationship("Alumno", back_populates="pesos")

class Rutina(Base):
    __tablename__ = "rutinas"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    nombre = Column(String(100))
    fecha_inicio = Column(DateTime)
    notas = Column(Text)
    entrenamientos_semana = Column(Integer, default=3)
    fecha_vencimiento = Column(DateTime, nullable=True)
    activa = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False)
    
    alumno = relationship("Alumno", back_populates="rutinas")
    ejercicios = relationship("Ejercicio", back_populates="rutina")

class EjercicioBase(Base):
    __tablename__ = "ejercicios_base"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), unique=True)
    categoria = Column(String(50))  # grupo muscular
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Ejercicio(Base):
    __tablename__ = "ejercicios"
    
    id = Column(Integer, primary_key=True)
    rutina_id = Column(Integer, ForeignKey("rutinas.id"))
    ejercicio_base_id = Column(Integer, ForeignKey("ejercicios_base.id"))
    dia = Column(Integer, default=1)  # día de la semana (1-7)
    series = Column(Integer)
    repeticiones = Column(Integer)
    peso = Column(Float, nullable=True)  # en kg
    descanso = Column(Integer)
    notas = Column(Text, nullable=True)
    
    rutina = relationship("Rutina", back_populates="ejercicios")
    ejercicio_base = relationship("EjercicioBase")

class RutinaPlantilla(Base):
    __tablename__ = "rutinas_plantilla"
    
    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("coaches.id"))
    nombre = Column(String(100))
    notas = Column(Text)
    entrenamientos_semana = Column(Integer, default=3)
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    coach = relationship("Coach")
    ejercicios = relationship("EjercicioPlantilla", back_populates="rutina_plantilla")

class EjercicioPlantilla(Base):
    __tablename__ = "ejercicios_plantilla"
    
    id = Column(Integer, primary_key=True)
    rutina_plantilla_id = Column(Integer, ForeignKey("rutinas_plantilla.id"))
    ejercicio_base_id = Column(Integer, ForeignKey("ejercicios_base.id"))
    series = Column(Integer)
    repeticiones = Column(Integer)
    peso = Column(Float, nullable=True)
    descanso = Column(Integer)
    notas = Column(Text, nullable=True)
    
    rutina_plantilla = relationship("RutinaPlantilla", back_populates="ejercicios")
    ejercicio_base = relationship("EjercicioBase")

class PersonalRecord(Base):
    __tablename__ = "personal_records"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    ejercicio = Column(String(50))  # sentadilla, press_militar, press_plano, peso_muerto
    peso = Column(Float)
    repeticiones = Column(Integer, default=1)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    alumno = relationship("Alumno")

class Alimento(Base):
    __tablename__ = "alimentos"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100))
    calorias_100g = Column(Float)  # por 100g
    proteinas_100g = Column(Float)  # por 100g
    carbohidratos_100g = Column(Float)  # por 100g
    grasas_100g = Column(Float)  # por 100g
    
class Dieta(Base):
    __tablename__ = "dietas"
    
    id = Column(Integer, primary_key=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"))
    nombre = Column(String(100))
    fecha_inicio = Column(DateTime)
    notas = Column(Text)
    activa = Column(Boolean, default=True)
    eliminado = Column(Boolean, default=False)
    
    alumno = relationship("Alumno", back_populates="dietas")
    comidas = relationship("Comida", back_populates="dieta")

class Comida(Base):
    __tablename__ = "comidas"
    
    id = Column(Integer, primary_key=True)
    dieta_id = Column(Integer, ForeignKey("dietas.id"))
    nombre = Column(String(100))  # desayuno, almuerzo, cena, etc
    dia = Column(Integer, default=1)  # día de la semana (1-7)
    orden = Column(Integer, default=1)
    
    dieta = relationship("Dieta", back_populates="comidas")
    alimentos = relationship("ComidaAlimento", back_populates="comida")

class ComidaAlimento(Base):
    __tablename__ = "comida_alimentos"
    
    id = Column(Integer, primary_key=True)
    comida_id = Column(Integer, ForeignKey("comidas.id"))
    alimento_id = Column(Integer, ForeignKey("alimentos.id"))
    cantidad_gramos = Column(Float)
    
    comida = relationship("Comida", back_populates="alimentos")
    alimento = relationship("Alimento")

class DietaPlantilla(Base):
    __tablename__ = "dietas_plantilla"
    
    id = Column(Integer, primary_key=True)
    coach_id = Column(Integer, ForeignKey("coaches.id"))
    nombre = Column(String(100))
    notas = Column(Text)
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    coach = relationship("Coach")
    comidas = relationship("ComidaPlantilla", back_populates="dieta_plantilla")

class ComidaPlantilla(Base):
    __tablename__ = "comidas_plantilla"
    
    id = Column(Integer, primary_key=True)
    dieta_plantilla_id = Column(Integer, ForeignKey("dietas_plantilla.id"))
    nombre = Column(String(100))
    orden = Column(Integer, default=1)
    
    dieta_plantilla = relationship("DietaPlantilla", back_populates="comidas")
    alimentos = relationship("ComidaPlantillaAlimento", back_populates="comida_plantilla")

class ComidaPlantillaAlimento(Base):
    __tablename__ = "comida_plantilla_alimentos"
    
    id = Column(Integer, primary_key=True)
    comida_plantilla_id = Column(Integer, ForeignKey("comidas_plantilla.id"))
    alimento_id = Column(Integer, ForeignKey("alimentos.id"))
    cantidad_gramos = Column(Float)
    
    comida_plantilla = relationship("ComidaPlantilla", back_populates="alimentos")
    alimento = relationship("Alimento")