from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, validator
from app.database import get_db
from app.models.models import Coach
from app.utils.auth_utils import verify_password, get_password_hash, create_access_token
from app.utils.validation import validate_email, validate_password_strength, sanitize_string, ValidationError

router = APIRouter(prefix="/auth", tags=["auth"])

class CoachRegister(BaseModel):
    nombre: str
    email: str
    password: str
    
    @validator('nombre')
    def validate_nombre(cls, v):
        v = sanitize_string(v)
        if not v or len(v.strip()) < 2 or len(v.strip()) > 100:
            raise ValueError('El nombre debe tener entre 2 y 100 caracteres')
        return v.strip()
    
    @validator('email')
    def validate_email_format(cls, v):
        v = sanitize_string(v).lower()
        if not validate_email(v):
            raise ValueError('Formato de email inválido')
        return v
    
    @validator('password')
    def validate_password_strength(cls, v):
        if not validate_password_strength(v):
            raise ValueError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número')
        return v

class CoachLogin(BaseModel):
    email: str
    password: str
    
    @validator('email')
    def validate_email_format(cls, v):
        v = sanitize_string(v).lower()
        if not validate_email(v):
            raise ValueError('Formato de email inválido')
        return v

@router.post("/register")
def register_coach(coach_data: CoachRegister, db: Session = Depends(get_db)):
    try:
        # Verificar si el email ya existe
        existing_coach = db.query(Coach).filter(Coach.email == coach_data.email).first()
        if existing_coach:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        # Crear nuevo coach
        hashed_password = get_password_hash(coach_data.password)
        new_coach = Coach(
            nombre=coach_data.nombre,
            email=coach_data.email,
            password_hash=hashed_password
        )
        
        db.add(new_coach)
        db.commit()
        db.refresh(new_coach)
        
        return {"message": "Coach registrado exitosamente", "coach_id": new_coach.id}
        
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al registrar el coach")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.message)

@router.post("/login")
def login_coach(coach_data: CoachLogin, db: Session = Depends(get_db)):
    try:
        coach = db.query(Coach).filter(Coach.email == coach_data.email).first()
        
        if not coach or not verify_password(coach_data.password, coach.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        access_token = create_access_token(data={"coach_id": coach.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "coach": {
                "id": coach.id,
                "nombre": coach.nombre,
                "email": coach.email
            }
        }
        
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Error al iniciar sesión")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.message)