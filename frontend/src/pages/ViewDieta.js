import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dietasAPI } from '../utils/api';
import Layout from '../components/Layout';
import CopyDayDietModal from '../components/CopyDayDietModal';

const ViewDieta = () => {
  const { dietaId } = useParams();
  const navigate = useNavigate();
  const [dieta, setDieta] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);

  useEffect(() => {
    fetchDieta();
  }, [dietaId]);

  const fetchDieta = async () => {
    try {
      const response = await dietasAPI.getById(dietaId);
      const dietaData = response.data;
      
      // Organize meals by day
      const diasComidas = {};
      for (let i = 1; i <= 7; i++) {
        diasComidas[i] = [];
      }
      
      dietaData.comidas?.forEach(comida => {
        const dia = comida.dia || 1;
        if (diasComidas[dia]) {
          diasComidas[dia].push(comida);
        }
      });
      
      dietaData.diasComidas = diasComidas;
      setDieta(dietaData);
    } catch (error) {
      console.error('Error fetching dieta:', error);
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

  if (!dieta) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  const macros = calculateMacros(dieta.comidas);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dieta: {dieta.nombre}</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCopyModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Copiar Menú
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Volver
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información de la Dieta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Alumno</p>
              <p className="font-semibold">{dieta.alumno ? dieta.alumno.nombre : 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de inicio</p>
              <p className="font-semibold">
                {dieta.fecha_inicio ? new Date(dieta.fecha_inicio).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold">
                <span className={`px-2 py-1 rounded text-xs ${dieta.activa ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  {dieta.activa ? 'Activa' : 'Inactiva'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Información Nutricional</p>
              <p className="font-semibold text-sm">
                {macros.calorias} kcal | P: {macros.proteinas}g | C: {macros.carbohidratos}g | G: {macros.grasas}g
              </p>
            </div>
          </div>
          {dieta.notas && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Notas</p>
              <p className="font-semibold">{dieta.notas}</p>
            </div>
          )}
        </div>

        {Object.keys(dieta.diasComidas || {}).some(dia => dieta.diasComidas[dia].length > 0) ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dieta por Menús</h2>
            <div className="space-y-6">
              {Object.entries(dieta.diasComidas || {}).map(([dia, comidas]) => (
                comidas.length > 0 && (
                  <div key={dia} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-purple-600">Menú {dia}</h3>
                    <div className="space-y-4">
                      {comidas.map((comida) => (
                        <div key={comida.id} className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">{comida.nombre}</h4>
                          <div className="space-y-2">
                            {comida.alimentos?.map((ca) => (
                              <div key={ca.id} className="p-3 bg-white rounded">
                                <h5 className="font-medium">{ca.alimento.nombre}</h5>
                                <p className="text-sm text-gray-600">
                                  {ca.cantidad_gramos}g - {Math.round(ca.alimento.calorias_100g * ca.cantidad_gramos / 100)} kcal
                                </p>
                                <p className="text-xs text-gray-500">
                                  P: {Math.round(ca.alimento.proteinas_100g * ca.cantidad_gramos / 100)}g | 
                                  C: {Math.round(ca.alimento.carbohidratos_100g * ca.cantidad_gramos / 100)}g | 
                                  G: {Math.round(ca.alimento.grasas_100g * ca.cantidad_gramos / 100)}g
                                </p>
                              </div>
                            ))}
                            {(!comida.alimentos || comida.alimentos.length === 0) && (
                              <p className="text-gray-500 text-center py-2">No hay alimentos en esta comida</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Esta dieta no tiene comidas asignadas</p>
          </div>
        )}
        
        <CopyDayDietModal
          isOpen={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          dietaId={dietaId}
          onSuccess={fetchDieta}
        />
      </div>
    </Layout>
  );
};

export default ViewDieta;