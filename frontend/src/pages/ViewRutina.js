import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rutinasAPI } from '../utils/api';
import Layout from '../components/Layout';
import CopyDayModal from '../components/CopyDayModal';

const ViewRutina = () => {
  const { rutinaId } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [diasEntrenamiento, setDiasEntrenamiento] = useState({});
  const [showCopyModal, setShowCopyModal] = useState(false);

  useEffect(() => {
    fetchRutina();
  }, [rutinaId]);

  const fetchRutina = async () => {
    try {
      const response = await rutinasAPI.getById(rutinaId);
      const rutinaData = response.data;
      setRutina(rutinaData);
      
      // Organizar ejercicios por día
      const dias = {};
      for (let i = 1; i <= rutinaData.entrenamientos_semana; i++) {
        dias[i] = [];
      }
      
      rutinaData.ejercicios.forEach(ejercicio => {
        const dia = ejercicio.dia || 1;
        if (dias[dia]) {
          dias[dia].push({
            ...ejercicio,
            ejercicio_nombre: ejercicio.ejercicio_base.nombre
          });
        }
      });
      
      setDiasEntrenamiento(dias);
    } catch (error) {
      console.error('Error fetching rutina:', error);
    }
  };

  if (!rutina) {
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
          <h1 className="text-3xl font-bold text-gray-900">Rutina: {rutina.nombre}</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCopyModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Copiar Día
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
          <h2 className="text-xl font-semibold mb-4">Información de la Rutina</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Alumno</p>
              <p className="font-semibold">{rutina.alumno.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de inicio</p>
              <p className="font-semibold">
                {rutina.fecha_inicio ? new Date(rutina.fecha_inicio).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Entrenamientos por semana</p>
              <p className="font-semibold">{rutina.entrenamientos_semana}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold">
                <span className={`px-2 py-1 rounded text-xs ${rutina.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {rutina.activa ? 'Activa' : 'Inactiva'}
                </span>
              </p>
            </div>
          </div>
          {rutina.notas && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Notas</p>
              <p className="font-semibold">{rutina.notas}</p>
            </div>
          )}
        </div>

        {Object.keys(diasEntrenamiento).some(dia => diasEntrenamiento[dia].length > 0) && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Rutina por Días</h2>
            <div className="space-y-6">
              {Object.entries(diasEntrenamiento).map(([dia, ejercicios]) => (
                ejercicios.length > 0 && (
                  <div key={dia} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-blue-600">Día {dia}</h3>
                    <div className="space-y-2">
                      {ejercicios.map((ejercicio, index) => (
                        <div key={ejercicio.id} className="p-3 bg-gray-50 rounded">
                          <h4 className="font-medium">{ejercicio.ejercicio_nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {ejercicio.series} series × {ejercicio.repeticiones} reps
                            {ejercicio.peso && ` × ${ejercicio.peso}kg`}
                            {ejercicio.descanso && ` - Descanso: ${ejercicio.descanso}s`}
                          </p>
                          {ejercicio.notas && ejercicio.notas.replace(`Día ${dia}: `, '') && (
                            <p className="text-sm text-gray-500">{ejercicio.notas.replace(`Día ${dia}: `, '')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {Object.keys(diasEntrenamiento).every(dia => diasEntrenamiento[dia].length === 0) && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Esta rutina no tiene ejercicios asignados</p>
          </div>
        )}
        
        <CopyDayModal
          isOpen={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          rutinaId={rutinaId}
          onSuccess={fetchRutina}
        />
      </div>
    </Layout>
  );
};

export default ViewRutina;