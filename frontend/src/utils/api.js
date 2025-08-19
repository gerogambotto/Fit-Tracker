import axios from 'axios';
import { formatErrorMessage } from './errorHandler';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Mejorar mensajes de error
    if (error.response?.data?.detail) {
      error.message = formatErrorMessage(error.response.data.detail);
    } else if (error.response?.status >= 500) {
      error.message = 'Error del servidor. Por favor, intenta más tarde.';
    } else if (error.response?.status >= 400) {
      error.message = 'Error en la solicitud. Verifica los datos ingresados.';
    } else if (error.code === 'NETWORK_ERROR') {
      error.message = 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Alumnos endpoints
export const alumnosAPI = {
  getAll: () => api.get('/alumnos'),
  create: (data) => api.post('/alumnos', data),
  getById: (id) => api.get(`/alumnos/${id}`),
  update: (id, data) => api.patch(`/alumnos/${id}`, data),
  delete: (id) => api.delete(`/alumnos/${id}`),
  getPesos: (id) => api.get(`/alumnos/${id}/pesos`),
  addPeso: (id, data) => api.post(`/alumnos/${id}/pesos`, data),
  getDashboard: (id) => api.get(`/alumnos/${id}/dashboard`),
  addPersonalRecord: (id, data) => api.post(`/alumnos/${id}/personal-records`, data),
  deletePersonalRecord: (prId) => api.delete(`/alumnos/personal-records/${prId}`),
  getPRChart: (id) => api.get(`/alumnos/${id}/pr-chart`),
};

// Rutinas endpoints
export const rutinasAPI = {
  getAll: () => api.get('/rutinas'),
  getByAlumno: (alumnoId) => api.get(`/alumnos/${alumnoId}/rutinas`),
  create: (alumnoId, data) => api.post(`/rutinas/create/${alumnoId || 'none'}`, data),
  getById: (id) => api.get(`/rutinas/${id}`),
  update: (id, data) => api.patch(`/rutinas/${id}`, data),
  delete: (id) => api.delete(`/rutinas/${id}`),
  addEjercicio: (id, data) => api.post(`/rutinas/${id}/ejercicios`, data),
  downloadPDF: (id) => api.get(`/rutinas/${id}/pdf`, { responseType: 'blob' }),
  downloadExcel: (id) => api.get(`/rutinas/${id}/excel`, { responseType: 'blob' }),
  copy: (rutinaId, targetAlumnoId) => api.post(`/rutinas/${rutinaId}/copy/${targetAlumnoId}`),
  copyDay: (rutinaId, sourceDay, targetDay) => api.post(`/rutinas/${rutinaId}/copy-day`, { source_day: sourceDay, target_day: targetDay }),
  saveAsTemplate: (rutinaId) => api.post(`/rutinas/${rutinaId}/save-as-template`),
  getPlantillas: () => api.get('/rutinas/plantillas'),
  createFromTemplate: (plantillaId, alumnoId) => api.post(`/rutinas/plantillas/${plantillaId}/create-rutina/${alumnoId}`),
};

// Ejercicios endpoints
export const ejerciciosAPI = {
  update: (id, data) => api.patch(`/ejercicios/${id}`, data),
  delete: (id) => api.delete(`/ejercicios/${id}`),
};

// Dashboard endpoints
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// Ejercicios base endpoints
export const ejerciciosBaseAPI = {
  getAll: () => api.get('/ejercicios-base'),
  search: (query) => api.get(`/ejercicios-base/search/${query}`),
  create: (data) => api.post('/ejercicios-base', data),
};

// Dietas endpoints
export const dietasAPI = {
  getAll: () => api.get('/dietas'),
  getByAlumno: (alumnoId) => api.get(`/alumnos/${alumnoId}/dietas`),
  create: (alumnoId, data) => api.post(`/dietas/create/${alumnoId || 'none'}`, data),
  getById: (id) => api.get(`/dietas/${id}`),
  update: (id, data) => api.patch(`/dietas/${id}`, data),
  delete: (id) => api.delete(`/dietas/${id}`),
  copy: (dietaId, targetAlumnoId) => api.post(`/dietas/${dietaId}/copy/${targetAlumnoId}`),
  addComida: (id, data) => api.post(`/dietas/${id}/comidas`, data),
  addAlimentoToComida: (comidaId, data) => api.post(`/dietas/comidas/${comidaId}/alimentos`, data),
  deleteComidaAlimento: (id) => api.delete(`/dietas/comida-alimentos/${id}`),
  updateComida: (comidaId, data) => api.patch(`/dietas/comidas/${comidaId}`, data),
  deleteComida: (comidaId) => api.delete(`/dietas/comidas/${comidaId}`),
  copyDay: (dietaId, sourceDay, targetDay) => api.post(`/dietas/${dietaId}/copy-day`, { source_day: sourceDay, target_day: targetDay }),
  saveAsTemplate: (dietaId) => api.post(`/dietas/${dietaId}/save-as-template`),
  getPlantillas: () => api.get('/dietas/plantillas'),
  createFromTemplate: (plantillaId, alumnoId) => api.post(`/dietas/plantillas/${plantillaId}/create-dieta/${alumnoId}`),
  downloadPDF: (id) => api.get(`/dietas/${id}/pdf`, { responseType: 'blob' }),
  downloadExcel: (id) => api.get(`/dietas/${id}/excel`, { responseType: 'blob' }),
};

// Alimentos endpoints
export const alimentosAPI = {
  getAll: () => api.get('/dietas/alimentos'),
  search: (query) => api.get(`/dietas/alimentos/search/${query}`),
  create: (data) => api.post('/dietas/alimentos', data),
};

// Notifications endpoints
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  generateTest: () => api.post('/notifications/generate-test'),
};

// Lesiones endpoints
export const lesionesAPI = {
  getByAlumno: (alumnoId) => api.get(`/lesiones/alumno/${alumnoId}`),
  create: (alumnoId, data) => api.post(`/lesiones/alumno/${alumnoId}`, data),
  update: (id, data) => api.patch(`/lesiones/${id}`, data),
  delete: (id) => api.delete(`/lesiones/${id}`),
};

// Email endpoints
export const emailAPI = {
  sendQuotaIncrease: (data) => api.post('/emails/quota-increase', data),
  sendAbsenceNotice: (data) => api.post('/emails/absence-notice', data),
};

export default api;