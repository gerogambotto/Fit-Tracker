import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rutinasAPI, ejerciciosAPI } from '../utils/api';
import Layout from '../components/Layout';
import EjercicioSelector from '../components/EjercicioSelector';

const EditRutina = () => {
  const { rutinaId } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [diasEntrenamiento, setDiasEntrenamiento] = useState({});
  const [diaActual, setDiaActual] = useState(1);
  const [editingDias, setEditingDias] = useState(false);
  const [newDiasCount, setNewDiasCount] = useState(3);
  const [ejercicioForm, setEjercicioForm] = useState({
    ejercicio_base_id: null,
    ejercicio_nombre: '',
    series: '',
    repeticiones: '',
    peso: '',
    descanso: '',
    notas: ''
  });

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
        const diaMatch = ejercicio.notas?.match(/Día (\d+):/);
        const dia = diaMatch ? parseInt(diaMatch[1]) : 1;
        if (dias[dia]) {
          dias[dia].push({
            ...ejercicio,
            ejercicio_nombre: ejercicio.ejercicio_base.nombre
          });
        }
      });
      
      setDiasEntrenamiento(dias);
      setNewDiasCount(rutinaData.entrenamientos_semana);
    } catch (error) {
      console.error('Error fetching rutina:', error);
    }
  };

  const updateDiasEntrenamiento = async () => {
    try {
      await rutinasAPI.update(rutinaId, {
        entrenamientos_semana: newDiasCount
      });
      
      // Reorganizar ejercicios
      const newDias = {};
      for (let i = 1; i <= newDiasCount; i++) {
        newDias[i] = diasEntrenamiento[i] || [];
      }
      
      setDiasEntrenamiento(newDias);
      setRutina({ ...rutina, entrenamientos_semana: newDiasCount });
      setEditingDias(false);
      setDiaActual(1);
    } catch (error) {
      console.error('Error updating dias:', error);
    }
  };

  const addEjercicio = async () => {
    if (ejercicioForm.ejercicio_base_id && ejercicioForm.series && ejercicioForm.repeticiones) {
      try {
        const response = await rutinasAPI.addEjercicio(rutinaId, {
          ejercicio_base_id: ejercicioForm.ejercicio_base_id,
          series: parseInt(ejercicioForm.series),
          repeticiones: parseInt(ejercicioForm.repeticiones),
          peso: ejercicioForm.peso ? parseFloat(ejercicioForm.peso) : null,
          descanso: parseInt(ejercicioForm.descanso) || 60,
          notas: `Día ${diaActual}: ${ejercicioForm.notas || ''}`.trim()
        });
        
        const nuevoEjercicio = {
          ...response.data,
          ejercicio_nombre: ejercicioForm.ejercicio_nombre
        };
        
        setDiasEntrenamiento(prev => ({
          ...prev,
          [diaActual]: [...prev[diaActual], nuevoEjercicio]
        }));
        
        setEjercicioForm({
          ejercicio_base_id: null,
          ejercicio_nombre: '',
          series: '',
          repeticiones: '',
          peso: '',
          descanso: '',
          notas: ''
        });
      } catch (error) {
        console.error('Error adding ejercicio:', error);
      }
    }
  };

  const removeEjercicio = async (dia, ejercicioId, index) => {
    try {
      await ejerciciosAPI.delete(ejercicioId);
      setDiasEntrenamiento(prev => ({
        ...prev,
        [dia]: prev[dia].filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing ejercicio:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Rutina: {rutina.nombre}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de eliminar esta rutina?')) {
                  rutinasAPI.delete(rutinaId).then(() => navigate(-1));
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Eliminar Rutina
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Agregar Ejercicios por Día</h2>
            <button
              onClick={() => setEditingDias(!editingDias)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
            >
              {editingDias ? 'Cancelar' : 'Cambiar Días'}
            </button>
          </div>
          
          {editingDias && (
            <div className="mb-4 p-4 bg-orange-50 rounded">
              <label className="block text-sm font-medium mb-2">Cambiar cantidad de días de entrenamiento:</label>
              <div className="flex items-center space-x-2">
                <select
                  className="border border-gray-300 rounded px-3 py-2"
                  value={newDiasCount}
                  onChange={(e) => setNewDiasCount(parseInt(e.target.value))}
                >
                  {[1,2,3,4,5,6,7].map(num => (
                    <option key={num} value={num}>{num} día{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <button
                  onClick={updateDiasEntrenamiento}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
                >
                  Actualizar
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Nota: Los ejercicios de días eliminados se perderán.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Seleccionar día de entrenamiento:</label>
            <div className="flex space-x-2">
              {Array.from({ length: rutina.entrenamientos_semana }, (_, i) => i + 1).map(dia => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => setDiaActual(dia)}
                  className={`px-4 py-2 rounded-lg ${
                    diaActual === dia 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Día {dia}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Agregar ejercicio al Día {diaActual}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <EjercicioSelector
                onSelect={(ejercicio) => setEjercicioForm({ 
                  ...ejercicioForm, 
                  ejercicio_base_id: ejercicio.id,
                  ejercicio_nombre: ejercicio.nombre
                })}
              />
              <input
                type="number"
                placeholder="Series"
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={ejercicioForm.series}
                onChange={(e) => setEjercicioForm({ ...ejercicioForm, series: e.target.value })}
              />
              <input
                type="number"
                placeholder="Repeticiones"
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={ejercicioForm.repeticiones}
                onChange={(e) => setEjercicioForm({ ...ejercicioForm, repeticiones: e.target.value })}
              />
              <input
                type="number"
                step="0.5"
                placeholder="Peso (kg)"
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={ejercicioForm.peso}
                onChange={(e) => setEjercicioForm({ ...ejercicioForm, peso: e.target.value })}
              />
              <input
                type="number"
                placeholder="Descanso (seg)"
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={ejercicioForm.descanso}
                onChange={(e) => setEjercicioForm({ ...ejercicioForm, descanso: e.target.value })}
              />
              <button
                type="button"
                onClick={addEjercicio}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Agregar
              </button>
            </div>
            <input
              type="text"
              placeholder="Notas del ejercicio"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={ejercicioForm.notas}
              onChange={(e) => setEjercicioForm({ ...ejercicioForm, notas: e.target.value })}
            />
          </div>
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
                        <div key={ejercicio.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex-1">
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
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                // Aquí podrías agregar lógica de edición inline
                                console.log('Edit ejercicio', ejercicio.id);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEjercicio(dia, ejercicio.id, index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditRutina;