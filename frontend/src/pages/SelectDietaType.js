import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dietasAPI } from '../utils/api';
import Layout from '../components/Layout';

const SelectDietaType = () => {
  const { alumnoId } = useParams();
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlantillas();
  }, []);

  const fetchPlantillas = async () => {
    try {
      const response = await dietasAPI.getPlantillas();
      setPlantillas(response.data);
    } catch (error) {
      console.error('Error fetching plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (plantillaId) => {
    try {
      await dietasAPI.createFromTemplate(plantillaId, alumnoId);
      navigate(`/alumnos/${alumnoId}`);
    } catch (error) {
      console.error('Error creating from template:', error);
    }
  };

  const calculateMacros = (comidas) => {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarbohidratos = 0;
    let totalGrasas = 0;

    comidas?.forEach(comida => {
      comida.alimentos?.forEach(ca => {
        const factor = ca.cantidad_gramos / 100;
        totalCalorias += ca.alimento.calorias_100g * factor;
        totalProteinas += ca.alimento.proteinas_100g * factor;
        totalCarbohidratos += ca.alimento.carbohidratos_100g * factor;
        totalGrasas += ca.alimento.grasas_100g * factor;
      });
    });

    return {
      calorias: Math.round(totalCalorias),
      proteinas: Math.round(totalProteinas),
      carbohidratos: Math.round(totalCarbohidratos),
      grasas: Math.round(totalGrasas)
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Dieta</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dieta Nueva</h2>
            <p className="text-gray-600 mb-4">Crear una dieta completamente nueva desde cero</p>
            <button
              onClick={() => navigate(`/alumnos/${alumnoId}/create-dieta`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Crear Dieta Nueva
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Usar Plantilla</h2>
            <p className="text-gray-600 mb-4">Seleccionar una dieta guardada como plantilla</p>
            
            {plantillas.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {plantillas.map((plantilla) => {
                  const macros = calculateMacros(plantilla.comidas);
                  return (
                    <div key={plantilla.id} className="border border-gray-200 rounded p-3">
                      <h3 className="font-medium">{plantilla.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        {plantilla.comidas?.length || 0} comidas
                      </p>
                      <p className="text-xs text-gray-500">
                        {macros.calorias} kcal | P: {macros.proteinas}g | C: {macros.carbohidratos}g | G: {macros.grasas}g
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes plantillas guardadas</p>
                <p className="text-sm text-gray-400">
                  Puedes guardar dietas como plantillas desde la vista de dietas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectDietaType;