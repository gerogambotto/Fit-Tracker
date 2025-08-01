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
  addPersonalRecord: (id, data) => api.post(`/alumnos/${id}/personal-records`, data),
  deletePersonalRecord: (prId) => api.delete(`/alumnos/personal-records/${prId}`),
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
  saveAsTemplate: (rutinaId) => api.post(`/rutinas/${rutinaId}/save-as-template`),
  getPlantillas: () => api.get('/plantillas'),
  createFromTemplate: (plantillaId, alumnoId) => api.post(`/plantillas/${plantillaId}/create-rutina/${alumnoId}`),
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
  getByAlumno: (alumnoId) => api.get(`/alumnos/${alumnoId}/dietas`),
  create: (alumnoId, data) => api.post(`/alumnos/${alumnoId}/dietas`, data),
  getById: (id) => api.get(`/dietas/${id}`),
  addComida: (id, data) => api.post(`/dietas/${id}/comidas`, data),
  addAlimentoToComida: (comidaId, data) => api.post(`/comidas/${comidaId}/alimentos`, data),
  deleteComidaAlimento: (id) => api.delete(`/comida-alimentos/${id}`),
  updateComida: (comidaId, data) => api.patch(`/comidas/${comidaId}`, data),
  deleteComida: (comidaId) => api.delete(`/comidas/${comidaId}`),
  saveAsTemplate: (dietaId) => api.post(`/dietas/${dietaId}/save-as-template`),
  getPlantillas: () => api.get('/dietas-plantillas'),
  createFromTemplate: (plantillaId, alumnoId) => api.post(`/dietas-plantillas/${plantillaId}/create-dieta/${alumnoId}`),
};

// Alimentos endpoints
export const alimentosAPI = {
  getAll: () => api.get('/alimentos'),
  search: (query) => api.get(`/alimentos/search/${query}`),
  create: (data) => api.post('/alimentos', data),
};

export default api;