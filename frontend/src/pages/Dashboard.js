import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.get();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('Error al cargar el dashboard. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="large" text="Cargando dashboard..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} onRetry={fetchDashboard} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/alumnos" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Alumnos</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData?.total_alumnos || 0}</p>
            <p className="text-sm text-blue-500 mt-2">Ver todos →</p>
          </Link>
          
          <Link to="/rutinas" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700">Rutinas Activas</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData?.total_rutinas || 0}</p>
            <p className="text-sm text-green-500 mt-2">Ver todas →</p>
          </Link>
          
          <Link to="/dietas" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700">Dietas Activas</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardData?.total_dietas || 0}</p>
            <p className="text-sm text-purple-500 mt-2">Ver todas →</p>
          </Link>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Acciones Rápidas</h3>
            <div className="space-y-2 mt-3">
              <Link to="/rutinas/create" className="block text-sm text-blue-600 hover:text-blue-800">+ Nueva Rutina</Link>
              <Link to="/dietas/create" className="block text-sm text-purple-600 hover:text-purple-800">+ Nueva Dieta</Link>
              <Link to="/alumnos" className="block text-sm text-green-600 hover:text-green-800">+ Nuevo Alumno</Link>
            </div>
          </div>
        </div>

        {dashboardData?.ultimos_alumnos?.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Últimos Alumnos Añadidos</h2>
            <div className="space-y-3">
              {dashboardData.ultimos_alumnos.slice(0, 4).map((alumno) => (
                <Link key={alumno.id} to={`/alumnos/${alumno.id}`} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium">{alumno.nombre}</p>
                    <p className="text-sm text-gray-600">{alumno.email}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(alumno.creado_en).toLocaleDateString()}
                  </div>
                </Link>
              ))}
              {dashboardData.ultimos_alumnos.length > 4 && (
                <Link to="/alumnos" className="block text-center text-blue-600 hover:text-blue-800 text-sm py-2">
                  Ver más ({dashboardData.ultimos_alumnos.length - 4} más)
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;