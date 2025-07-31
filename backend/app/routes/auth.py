from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.models import Coach
from app.utils.auth_utils import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class CoachRegister(BaseModel):
    nombre: str
    email: str
    password: str

class CoachLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register_coach(coach_data: CoachRegister, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    existing_coach = db.query(Coach).filter(Coach.email == coach_data.email).first()
    if existing_coach:
        raise HTTPException(status_code=400, detail="Email already registered")
    
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
    
    return {"message": "Coach registered successfully", "coach_id": new_coach.id}

@router.post("/login")
def login_coach(coach_data: CoachLogin, db: Session = Depends(get_db)):
    coach = db.query(Coach).filter(Coach.email == coach_data.email).first()
    
    if not coach or not verify_password(coach_data.password, coach.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
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