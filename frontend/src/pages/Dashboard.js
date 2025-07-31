import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.get();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Alumnos</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData?.total_alumnos || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Rutinas Activas</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData?.total_rutinas || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <Link to="/alumnos" className="block">
              <h3 className="text-lg font-semibold text-gray-700">Gestionar Alumnos</h3>
              <p className="text-blue-600 hover:text-blue-800">Ver todos →</p>
            </Link>
          </div>
        </div>

        {dashboardData?.ultimos_alumnos?.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Últimos Alumnos Añadidos</h2>
            <div className="space-y-3">
              {dashboardData.ultimos_alumnos.map((alumno) => (
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
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;