import React, { useState, useEffect } from 'react';
import { alumnosAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    fecha_nacimiento: '',
    altura: '',
    peso_inicial: '',
    objetivo: '',
    fecha_cobro: ''
  });

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await alumnosAPI.getAll();
      setAlumnos(response.data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const alumnoResponse = await alumnosAPI.create({
        nombre: formData.nombre,
        email: formData.email,
        fecha_nacimiento: formData.fecha_nacimiento + 'T00:00:00',
        altura: parseFloat(formData.altura),
        objetivo: formData.objetivo,
        fecha_cobro: formData.fecha_cobro ? formData.fecha_cobro + 'T00:00:00' : null
      });
      
      // Agregar peso inicial
      if (formData.peso_inicial) {
        await alumnosAPI.addPeso(alumnoResponse.data.id, {
          peso: parseFloat(formData.peso_inicial)
        });
      }
      setFormData({ nombre: '', email: '', fecha_nacimiento: '', altura: '', peso_inicial: '', objetivo: '', fecha_cobro: '' });
      setShowForm(false);
      fetchAlumnos();
    } catch (error) {
      console.error('Error creating alumno:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este alumno?')) {
      try {
        await alumnosAPI.delete(id);
        fetchAlumnos();
      } catch (error) {
        console.error('Error deleting alumno:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mis Alumnos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancelar' : 'Nuevo Alumno'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Nuevo Alumno</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (metros)</label>
                <input
                  type="number"
                  step="0.01"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso inicial (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.peso_inicial}
                  onChange={(e) => setFormData({ ...formData, peso_inicial: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cobro mensual</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  value={formData.fecha_cobro}
                  onChange={(e) => setFormData({ ...formData, fecha_cobro: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Crear Alumno
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumnos.map((alumno) => (
            <div key={alumno.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{alumno.nombre}</h3>
              <p className="text-gray-600 mb-1">{alumno.email}</p>
              <p className="text-gray-600 mb-1">Altura: {alumno.altura}m</p>
              <p className="text-gray-600 mb-4">Objetivo: {alumno.objetivo}</p>
              
              <div className="flex space-x-2">
                <Link
                  to={`/alumnos/${alumno.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Ver Detalle
                </Link>
                <button
                  onClick={() => handleDelete(alumno.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {alumnos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tienes alumnos registrados aún.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Crear tu primer alumno
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Alumnos;