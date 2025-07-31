from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.models import Base
from app.routes import auth, alumnos, rutinas, dashboard, ejercicios_base

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitTracker API", version="1.0.0")

# Ejecutar recordatorios al iniciar
@app.on_event("startup")
async def startup_event():
    from app.tasks.payment_reminders import check_payment_reminders
    try:
        check_payment_reminders()
    except Exception as e:
        print(f"Error ejecutando recordatorios: {e}")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(auth.router)
app.include_router(alumnos.router)
app.include_router(rutinas.router)
app.include_router(dashboard.router)
app.include_router(ejercicios_base.router)

@app.get("/")
def read_root():
    return {"message": "FitTracker API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)