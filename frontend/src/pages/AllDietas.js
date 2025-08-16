import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dietasAPI, alumnosAPI } from '../utils/api';
import Layout from '../components/Layout';

const AllDietas = () => {
  const [dietas, setDietas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alumnosResponse] = await Promise.all([
        alumnosAPI.getAll()
      ]);
      
      setAlumnos(alumnosResponse.data);
      
      // Get dietas for all alumnos
      const allDietas = [];
      for (const alumno of alumnosResponse.data) {
        try {
          const dietasResponse = await dietasAPI.getByAlumno(alumno.id);
          dietasResponse.data.forEach(dieta => {
            allDietas.push({
              ...dieta,
              alumno_nombre: alumno.nombre
            });
          });
        } catch (error) {
          console.error(`Error fetching dietas for alumno ${alumno.id}:`, error);
        }
      }
      
      setDietas(allDietas.sort((a, b) => new Date(b.fecha_inicio || 0) - new Date(a.fecha_inicio || 0)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Todas las Dietas</h1>
          <Link
            to="/dietas/create"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Nueva Dieta
          </Link>
        </div>

        <div className="grid gap-4">
          {dietas.map((dieta) => (
            <div key={dieta.id} className={`bg-white p-6 rounded-lg shadow ${
              dieta.activa ? 'border-l-4 border-purple-500' : ''
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{dieta.nombre}</h3>
                    {dieta.activa && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">Alumno: {dieta.alumno_nombre}</p>
                  <p className="text-sm text-gray-500">
                    Fecha: {dieta.fecha_inicio ? new Date(dieta.fecha_inicio).toLocaleDateString() : 'No especificada'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Comidas: {dieta.comidas?.length || 0}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/dietas/${dieta.id}/view`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/dietas/${dieta.id}/edit`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {dietas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay dietas creadas</p>
            <Link
              to="/dietas/create"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Crear Primera Dieta
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllDietas;