import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rutinasAPI } from '../utils/api';
import Layout from '../components/Layout';

const SelectRutinaType = () => {
  const { alumnoId } = useParams();
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlantillas();
  }, []);

  const fetchPlantillas = async () => {
    try {
      const response = await rutinasAPI.getPlantillas();
      setPlantillas(response.data);
    } catch (error) {
      console.error('Error fetching plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (plantillaId) => {
    try {
      await rutinasAPI.createFromTemplate(plantillaId, alumnoId);
      navigate(`/alumnos/${alumnoId}`);
    } catch (error) {
      console.error('Error creating from template:', error);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Rutina</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Rutina Nueva</h2>
            <p className="text-gray-600 mb-4">Crear una rutina completamente nueva desde cero</p>
            <button
              onClick={() => navigate(`/alumnos/${alumnoId}/create-rutina`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Crear Rutina Nueva
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Usar Plantilla</h2>
            <p className="text-gray-600 mb-4">Seleccionar una rutina guardada como plantilla</p>
            
            {plantillas.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {plantillas.map((plantilla) => (
                  <div key={plantilla.id} className="border border-gray-200 rounded p-3">
                    <h3 className="font-medium">{plantilla.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      {plantilla.ejercicios?.length || 0} ejercicios | {plantilla.entrenamientos_semana} días
                    </p>
                    {plantilla.notas && (
                      <p className="text-sm text-gray-500 mt-1">{plantilla.notas}</p>
                    )}
                    <button
                      onClick={() => createFromTemplate(plantilla.id)}
                      className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Usar Esta Plantilla
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes plantillas guardadas</p>
                <p className="text-sm text-gray-400">
                  Puedes guardar rutinas como plantillas desde la vista de rutinas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectRutinaType;