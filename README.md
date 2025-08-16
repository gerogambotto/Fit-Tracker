# FitTracker

Una aplicación web Full Stack para que coaches gestionen a sus alumnos, asignen rutinas personalizadas, registren pesos de progreso y generen reportes en PDF/Excel.

## ✨ Características

- 📊 **Dashboard completo** con estadísticas y métricas
- 👥 **Gestión de alumnos** con perfiles detallados
- 💪 **Rutinas personalizadas** con ejercicios y plantillas
- 🍽️ **Planes de dieta** con seguimiento nutricional
- 📈 **Seguimiento de progreso** con gráficos y estadísticas
- 📧 **Recordatorios automáticos** de pago por email
- 📊 **Exportación** de rutinas en PDF y Excel
- 🔒 **Autenticación segura** con JWT
- 📱 **Diseño responsive** para móviles y desktop

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
- **Resend** - Servicio de email

### Frontend
- **React** - Biblioteca de interfaz de usuario
- **TailwindCSS** - Framework de CSS
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos
- **JWT-decode** - Decodificación de tokens

## 🚀 Instalación

### Prerrequisitos

- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Git

### Backend

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd Fit-Tracker/backend
```

2. **Crear entorno virtual:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

4. **Configurar base de datos:**
   - Crear base de datos MySQL llamada `fittracker`
   - Actualizar el archivo `.env` con tus credenciales:

```env
DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost:3306/fittracker
SECRET_KEY=tu-clave-secreta-super-segura-de-al-menos-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
RESEND_API_KEY=tu-api-key-de-resend
FROM_EMAIL=noreply@tudominio.com
```

5. **Ejecutar migraciones:**
```bash
alembic upgrade head
```

6. **Poblar datos iniciales (opcional):**
```bash
python seed_ejercicios.py
python seed_alimentos.py
```

7. **Ejecutar servidor:**
```bash
python -m app.main
```

El backend estará disponible en `http://localhost:8000`

### Frontend

1. **Navegar al directorio del frontend:**
```bash
cd ../frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Ejecutar aplicación:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

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

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Configuración de Producción

### Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en producción:

```env
# Base de datos
DATABASE_URL=mysql+mysqlconnector://user:password@host:port/database

# Seguridad
SECRET_KEY=clave-super-segura-de-al-menos-32-caracteres-para-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# Email
RESEND_API_KEY=tu-api-key-de-resend-para-produccion
FROM_EMAIL=noreply@tudominio.com
```

### Recordatorios de Pago

Para configurar recordatorios automáticos de pago, agrega un cron job:

```bash
# Ejecutar todos los días a las 9:00 AM
0 9 * * * cd /path/to/fittracker/backend && python run_payment_reminders.py
```

## 🔧 Mejoras Implementadas

### Seguridad
- ✅ Validación de entrada y sanitización
- ✅ Protección contra XSS
- ✅ Manejo seguro de tokens JWT
- ✅ Actualización de dependencias vulnerables

### Performance
- ✅ Índices de base de datos optimizados
- ✅ Transacciones batch para operaciones múltiples
- ✅ Eager loading para consultas relacionadas
- ✅ Manejo eficiente de errores

### Experiencia de Usuario
- ✅ Componentes de carga y error
- ✅ Sistema de notificaciones
- ✅ Validación en tiempo real
- ✅ Mensajes de error mejorados
- ✅ Diseño responsive

### Mantenibilidad
- ✅ Logging estructurado
- ✅ Manejo de errores centralizado
- ✅ Código reutilizable
- ✅ Documentación mejorada

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