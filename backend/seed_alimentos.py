from app.database import SessionLocal
from app.models.models import Alimento

def seed_alimentos():
    db = SessionLocal()
    
    # Verificar si ya existen alimentos
    if db.query(Alimento).first():
        print("Alimentos ya existen")
        return
    
    alimentos_base = [
        # Proteínas
        {"nombre": "Pollo pechuga", "calorias_100g": 165, "proteinas_100g": 31, "carbohidratos_100g": 0, "grasas_100g": 3.6},
        {"nombre": "Huevo entero", "calorias_100g": 155, "proteinas_100g": 13, "carbohidratos_100g": 1.1, "grasas_100g": 11},
        {"nombre": "Atún en agua", "calorias_100g": 116, "proteinas_100g": 26, "carbohidratos_100g": 0, "grasas_100g": 1},
        {"nombre": "Carne molida magra", "calorias_100g": 250, "proteinas_100g": 26, "carbohidratos_100g": 0, "grasas_100g": 15},
        
        # Carbohidratos
        {"nombre": "Arroz blanco cocido", "calorias_100g": 130, "proteinas_100g": 2.7, "carbohidratos_100g": 28, "grasas_100g": 0.3},
        {"nombre": "Avena", "calorias_100g": 389, "proteinas_100g": 17, "carbohidratos_100g": 66, "grasas_100g": 7},
        {"nombre": "Papa cocida", "calorias_100g": 87, "proteinas_100g": 2, "carbohidratos_100g": 20, "grasas_100g": 0.1},
        {"nombre": "Pan integral", "calorias_100g": 247, "proteinas_100g": 13, "carbohidratos_100g": 41, "grasas_100g": 4.2},
        {"nombre": "Banana", "calorias_100g": 89, "proteinas_100g": 1.1, "carbohidratos_100g": 23, "grasas_100g": 0.3},
        
        # Grasas
        {"nombre": "Aceite de oliva", "calorias_100g": 884, "proteinas_100g": 0, "carbohidratos_100g": 0, "grasas_100g": 100},
        {"nombre": "Palta", "calorias_100g": 160, "proteinas_100g": 2, "carbohidratos_100g": 9, "grasas_100g": 15},
        {"nombre": "Almendras", "calorias_100g": 579, "proteinas_100g": 21, "carbohidratos_100g": 22, "grasas_100g": 50},
        
        # Vegetales
        {"nombre": "Brócoli", "calorias_100g": 34, "proteinas_100g": 2.8, "carbohidratos_100g": 7, "grasas_100g": 0.4},
        {"nombre": "Espinaca", "calorias_100g": 23, "proteinas_100g": 2.9, "carbohidratos_100g": 3.6, "grasas_100g": 0.4},
        {"nombre": "Tomate", "calorias_100g": 18, "proteinas_100g": 0.9, "carbohidratos_100g": 3.9, "grasas_100g": 0.2},
        
        # Lácteos
        {"nombre": "Leche descremada", "calorias_100g": 42, "proteinas_100g": 3.4, "carbohidratos_100g": 5, "grasas_100g": 0.1},
        {"nombre": "Yogur griego", "calorias_100g": 59, "proteinas_100g": 10, "carbohidratos_100g": 3.6, "grasas_100g": 0.4},
        {"nombre": "Queso cottage", "calorias_100g": 98, "proteinas_100g": 11, "carbohidratos_100g": 3.4, "grasas_100g": 4.3},
    ]
    
    for alimento_data in alimentos_base:
        alimento = Alimento(**alimento_data)
        db.add(alimento)
    
    db.commit()
    print(f"Se agregaron {len(alimentos_base)} alimentos base")
    db.close()

if __name__ == "__main__":
    seed_alimentos()