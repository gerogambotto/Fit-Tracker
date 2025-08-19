from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from app.database import engine
from app.models.models import Base
from app.routes import auth, alumnos, rutinas, dashboard, ejercicios_base, dietas, notifications, lesiones, emails

# Crear tablas
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Comentado temporalmente para evitar errores de email
    # from app.tasks.payment_reminders import check_payment_reminders
    # try:
    #     check_payment_reminders()
    # except Exception as e:
    #     print(f"Error ejecutando recordatorios: {e}")
    yield
    # Shutdown (if needed)

app = FastAPI(title="FitTracker API", version="1.0.0", lifespan=lifespan)

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
app.include_router(dietas.router)
app.include_router(notifications.router)
app.include_router(lesiones.router)
app.include_router(emails.router)

@app.get("/")
def read_root():
    return {"message": "FitTracker API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)