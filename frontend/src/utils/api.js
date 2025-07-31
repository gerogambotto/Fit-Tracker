import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
};

// Rutinas endpoints
export const rutinasAPI = {
  getByAlumno: (alumnoId) => api.get(`/alumnos/${alumnoId}/rutinas`),
  create: (alumnoId, data) => api.post(`/alumnos/${alumnoId}/rutinas`, data),
  getById: (id) => api.get(`/rutinas/${id}`),
  update: (id, data) => api.patch(`/rutinas/${id}`, data),
  delete: (id) => api.delete(`/rutinas/${id}`),
  addEjercicio: (id, data) => api.post(`/rutinas/${id}/ejercicios`, data),
  downloadPDF: (id) => api.get(`/rutinas/${id}/pdf`, { responseType: 'blob' }),
  downloadExcel: (id) => api.get(`/rutinas/${id}/excel`, { responseType: 'blob' }),
  copy: (rutinaId, targetAlumnoId) => api.post(`/rutinas/${rutinaId}/copy/${targetAlumnoId}`),
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

export default api;