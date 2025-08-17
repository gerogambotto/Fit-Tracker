import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rutinasAPI, alumnosAPI } from '../utils/api';
import Layout from '../components/Layout';
import EjercicioSelector from '../components/EjercicioSelector';

const CreateStandaloneRutina = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [rutinaData, setRutinaData] = useState({
    nombre: '',
    notas: '',
    entrenamientos_semana: 3,
    fecha_vencimiento: '',
    alumno_id: ''
  });
  const [diasEntrenamiento, setDiasEntrenamiento] = useState({});
  const [diaActual, setDiaActual] = useState(1);
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
    fetchAlumnos();
  }, []);

  useEffect(() => {
    const dias = {};
    for (let i = 1; i <= rutinaData.entrenamientos_semana; i++) {
      dias[i] = [];
    }
    setDiasEntrenamiento(dias);
    setDiaActual(1);
  }, [rutinaData.entrenamientos_semana]);

  const fetchAlumnos = async () => {
    try {
      const response = await alumnosAPI.getAll();
      setAlumnos(response.data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const addEjercicio = () => {
    if (ejercicioForm.ejercicio_base_id && ejercicioForm.series && ejercicioForm.repeticiones) {
      const nuevoEjercicio = {
        ejercicio_base_id: ejercicioForm.ejercicio_base_id,
        ejercicio_nombre: ejercicioForm.ejercicio_nombre,
        series: parseInt(ejercicioForm.series),
        repeticiones: parseInt(ejercicioForm.repeticiones),
        peso: ejercicioForm.peso ? parseFloat(ejercicioForm.peso) : null,
        descanso: parseInt(ejercicioForm.descanso) || 60,
        notas: ejercicioForm.notas
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
    }
  };

  const removeEjercicio = (dia, index) => {
    setDiasEntrenamiento(prev => ({
      ...prev,
      [dia]: prev[dia].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    console.log('Creating routine with data:', rutinaData);
    try {
      const alumnoId = rutinaData.alumno_id || null;
      
      const rutinaResponse = await rutinasAPI.create(alumnoId, {
        nombre: rutinaData.nombre,
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: rutinaData.fecha_vencimiento ? rutinaData.fecha_vencimiento + 'T00:00:00' : null,
        notas: rutinaData.notas,
        entrenamientos_semana: rutinaData.entrenamientos_semana
      });
      
      console.log('Routine created:', rutinaResponse.data);

      // Add exercises by day
      for (const [dia, ejercicios] of Object.entries(diasEntrenamiento)) {
        for (const ejercicio of ejercicios) {
          await rutinasAPI.addEjercicio(rutinaResponse.data.id, {
            ejercicio_base_id: ejercicio.ejercicio_base_id,
            dia: parseInt(dia),
            series: ejercicio.series,
            repeticiones: ejercicio.repeticiones,
            peso: ejercicio.peso,
            descanso: ejercicio.descanso,
            notas: ejercicio.notas
          });
        }
      }

      navigate('/rutinas');
    } catch (error) {
      console.error('Error creating rutina:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Rutina</h1>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Información de la Rutina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre de la rutina"
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={rutinaData.nombre}
                onChange={(e) => setRutinaData({ ...rutinaData, nombre: e.target.value })}
                required
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={rutinaData.alumno_id}
                onChange={(e) => setRutinaData({ ...rutinaData, alumno_id: e.target.value })}
              >
                <option value="">Sin asignar a alumno</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>{alumno.nombre}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento:</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={rutinaData.fecha_vencimiento}
                onChange={(e) => setRutinaData({ ...rutinaData, fecha_vencimiento: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Notas generales de la rutina"
              className="w-full mt-4 border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              value={rutinaData.notas}
              onChange={(e) => setRutinaData({ ...rutinaData, notas: e.target.value })}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Configurar Ejercicios</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Días de entrenamiento por semana:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={rutinaData.entrenamientos_semana}
                onChange={(e) => setRutinaData({ ...rutinaData, entrenamientos_semana: parseInt(e.target.value) })}
              >
                {[1,2,3,4,5,6,7].map(num => (
                  <option key={num} value={num}>{num} día{num > 1 ? 's' : ''} por semana</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Seleccionar día:</label>
              <div className="flex space-x-2">
                {Array.from({ length: rutinaData.entrenamientos_semana }, (_, i) => i + 1).map(dia => (
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
              <h2 className="text-xl font-semibold mb-4">Vista Previa de la Rutina</h2>
              <div className="space-y-6">
                {Object.entries(diasEntrenamiento).map(([dia, ejercicios]) => (
                  ejercicios.length > 0 && (
                    <div key={dia} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 text-blue-600">Día {dia}</h3>
                      <div className="space-y-2">
                        {ejercicios.map((ejercicio, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <h4 className="font-medium">{ejercicio.ejercicio_nombre}</h4>
                              <p className="text-sm text-gray-600">
                                {ejercicio.series} series × {ejercicio.repeticiones} reps
                                {ejercicio.peso && ` × ${ejercicio.peso}kg`}
                                {ejercicio.descanso && ` - Descanso: ${ejercicio.descanso}s`}
                              </p>
                              {ejercicio.notas && (
                                <p className="text-sm text-gray-500">{ejercicio.notas}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEjercicio(dia, index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!rutinaData.nombre}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Crear Rutina
            </button>
            <button
              type="button"
              onClick={() => navigate('/rutinas')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateStandaloneRutina;