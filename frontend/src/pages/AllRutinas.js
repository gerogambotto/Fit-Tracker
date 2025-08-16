import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rutinasAPI, alumnosAPI } from '../utils/api';
import Layout from '../components/Layout';

const AllRutinas = () => {
  const [rutinas, setRutinas] = useState([]);
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
      
      // Get rutinas for all alumnos
      const allRutinas = [];
      for (const alumno of alumnosResponse.data) {
        try {
          const rutinasResponse = await rutinasAPI.getByAlumno(alumno.id);
          rutinasResponse.data.forEach(rutina => {
            allRutinas.push({
              ...rutina,
              alumno_nombre: alumno.nombre
            });
          });
        } catch (error) {
          console.error(`Error fetching rutinas for alumno ${alumno.id}:`, error);
        }
      }
      
      setRutinas(allRutinas.sort((a, b) => new Date(b.fecha_inicio || 0) - new Date(a.fecha_inicio || 0)));
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
          <h1 className="text-3xl font-bold text-gray-900">Todas las Rutinas</h1>
          <Link
            to="/rutinas/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Nueva Rutina
          </Link>
        </div>

        <div className="grid gap-4">
          {rutinas.map((rutina) => (
            <div key={rutina.id} className={`bg-white p-6 rounded-lg shadow ${
              rutina.activa ? 'border-l-4 border-green-500' : ''
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{rutina.nombre}</h3>
                    {rutina.activa && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">Alumno: {rutina.alumno_nombre}</p>
                  <p className="text-sm text-gray-500">
                    Fecha: {rutina.fecha_inicio ? new Date(rutina.fecha_inicio).toLocaleDateString() : 'No especificada'}
                  </p>
                  {rutina.fecha_vencimiento && (
                    <p className={`text-sm ${
                      new Date(rutina.fecha_vencimiento) < new Date() 
                        ? 'text-red-600 font-semibold' 
                        : 'text-gray-500'
                    }`}>
                      Vence: {new Date(rutina.fecha_vencimiento).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Ejercicios: {rutina.ejercicios?.length || 0} | Días: {rutina.entrenamientos_semana}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/rutinas/${rutina.id}/view`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/rutinas/${rutina.id}/edit`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rutinas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay rutinas creadas</p>
            <Link
              to="/rutinas/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Crear Primera Rutina
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllRutinas;