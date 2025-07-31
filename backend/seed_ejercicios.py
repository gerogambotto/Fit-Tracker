from app.database import SessionLocal
from app.models.models import EjercicioBase

def seed_ejercicios():
    db = SessionLocal()
    
    ejercicios_iniciales = [
        # Pecho
        {"nombre": "Press de banca plano", "categoria": "Pecho"},
        {"nombre": "Press de banca inclinado", "categoria": "Pecho"},
        {"nombre": "Press de banca declinado", "categoria": "Pecho"},
        {"nombre": "Flexiones", "categoria": "Pecho"},
        {"nombre": "Aperturas con mancuernas", "categoria": "Pecho"},
        
        # Espalda
        {"nombre": "Dominadas", "categoria": "Espalda"},
        {"nombre": "Remo con barra", "categoria": "Espalda"},
        {"nombre": "Remo con mancuerna", "categoria": "Espalda"},
        {"nombre": "Jalones al pecho", "categoria": "Espalda"},
        {"nombre": "Peso muerto", "categoria": "Espalda"},
        
        # Hombros
        {"nombre": "Press militar", "categoria": "Hombros"},
        {"nombre": "Elevaciones laterales", "categoria": "Hombros"},
        {"nombre": "Elevaciones frontales", "categoria": "Hombros"},
        {"nombre": "Pájaros", "categoria": "Hombros"},
        
        # Brazos
        {"nombre": "Curl de bíceps", "categoria": "Brazos"},
        {"nombre": "Curl martillo", "categoria": "Brazos"},
        {"nombre": "Extensiones de tríceps", "categoria": "Brazos"},
        {"nombre": "Fondos en paralelas", "categoria": "Brazos"},
        
        # Piernas
        {"nombre": "Sentadillas", "categoria": "Piernas"},
        {"nombre": "Prensa de piernas", "categoria": "Piernas"},
        {"nombre": "Extensiones de cuádriceps", "categoria": "Piernas"},
        {"nombre": "Curl de femoral", "categoria": "Piernas"},
        {"nombre": "Elevaciones de gemelos", "categoria": "Piernas"},
        
        # Core
        {"nombre": "Abdominales", "categoria": "Core"},
        {"nombre": "Plancha", "categoria": "Core"},
        {"nombre": "Elevaciones de piernas", "categoria": "Core"},
        
        # Cardio
        {"nombre": "Cinta de correr", "categoria": "Cardio"},
        {"nombre": "Bicicleta estática", "categoria": "Cardio"},
        {"nombre": "Elíptica", "categoria": "Cardio"},
    ]
    
    for ejercicio_data in ejercicios_iniciales:
        existing = db.query(EjercicioBase).filter(EjercicioBase.nombre == ejercicio_data["nombre"]).first()
        if not existing:
            ejercicio = EjercicioBase(**ejercicio_data)
            db.add(ejercicio)
    
    db.commit()
    db.close()
    print("Ejercicios iniciales creados exitosamente")

if __name__ == "__main__":
    seed_ejercicios()