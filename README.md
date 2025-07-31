# FitTracker

Una aplicación web Full Stack para que coaches gestionen a sus alumnos, asignen rutinas personalizadas, registren pesos de progreso y generen reportes en PDF/Excel.

## Tecnologías

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para base de datos
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Alembic** - Migraciones de base de datos
- **pdfkit** - Generación de PDF
- **openpyxl** - Generación de Excel
- **pytest** - Testing

### Frontend
- **React** - Biblioteca de interfaz de usuario
- **TailwindCSS** - Framework de CSS
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos
- **JWT-decode** - Decodificación de tokens

## Instalación

### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar base de datos MySQL y actualizar `.env`

5. Ejecutar migraciones:
```bash
alembic upgrade head
```

6. Ejecutar servidor:
```bash
python -m app.main
```

### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar aplicación:
```bash
npm start
```

## Funcionalidades

### Autenticación
- Registro de coach
- Login con JWT
- Middleware de autenticación

### Gestión de Alumnos
- CRUD completo de alumnos
- Dashboard individual por alumno
- Registro de pesos con histórico
- Gráficos de progreso

### Gestión de Rutinas
- Crear rutinas personalizadas
- Agregar ejercicios a rutinas
- Exportar rutinas en PDF y Excel
- CRUD completo

### Dashboard
- Estadísticas generales
- Últimos alumnos añadidos
- Resumen de rutinas activas

## API Endpoints

### Autenticación
- `POST /auth/register` - Registro de coach
- `POST /auth/login` - Login de coach

### Alumnos
- `GET /alumnos` - Listar alumnos
- `POST /alumnos` - Crear alumno
- `GET /alumnos/{id}` - Obtener alumno
- `PATCH /alumnos/{id}` - Actualizar alumno
- `DELETE /alumnos/{id}` - Eliminar alumno
- `GET /alumnos/{id}/pesos` - Histórico de pesos
- `POST /alumnos/{id}/pesos` - Agregar peso
- `GET /alumnos/{id}/dashboard` - Dashboard del alumno

### Rutinas
- `GET /alumnos/{id}/rutinas` - Rutinas del alumno
- `POST /alumnos/{id}/rutinas` - Crear rutina
- `GET /rutinas/{id}` - Obtener rutina
- `PATCH /rutinas/{id}` - Actualizar rutina
- `DELETE /rutinas/{id}` - Eliminar rutina
- `POST /rutinas/{id}/ejercicios` - Agregar ejercicio
- `GET /rutinas/{id}/pdf` - Descargar PDF
- `GET /rutinas/{id}/excel` - Descargar Excel

### Dashboard
- `GET /dashboard` - Dashboard del coach

## Testing

Ejecutar tests del backend:
```bash
cd backend
pytest
```

## Estructura del Proyecto

```
fittracker/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── utils/
    │   └── App.js
    └── package.json
```