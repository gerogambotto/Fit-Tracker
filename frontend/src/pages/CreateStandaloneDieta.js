import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dietasAPI, alumnosAPI } from '../utils/api';
import Layout from '../components/Layout';
import AlimentoSelector from '../components/AlimentoSelector';

const CreateStandaloneDieta = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [dietaData, setDietaData] = useState({
    nombre: '',
    notas: '',
    alumno_id: ''
  });
  const [diasComidas, setDiasComidas] = useState({});
  const [diaActual, setDiaActual] = useState(1);
  const [totalMenus, setTotalMenus] = useState(1);
  const [comidaForm, setComidaForm] = useState({
    nombre: '',
    orden: 1
  });
  const [alimentoForm, setAlimentoForm] = useState({
    alimento_id: null,
    alimento_nombre: '',
    cantidad_gramos: ''
  });
  const [comidaSeleccionada, setComidaSeleccionada] = useState(null);

  useEffect(() => {
    fetchAlumnos();
    initializeDays();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await alumnosAPI.getAll();
      setAlumnos(response.data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const initializeDays = () => {
    const dias = {};
    for (let i = 1; i <= totalMenus; i++) {
      dias[i] = [];
    }
    setDiasComidas(dias);
  };

  useEffect(() => {
    initializeDays();
  }, [totalMenus]);

  const addComida = () => {
    if (comidaForm.nombre) {
      const nuevaComida = {
        id: Date.now(),
        nombre: comidaForm.nombre,
        orden: comidaForm.orden,
        alimentos: []
      };
      
      setDiasComidas(prev => ({
        ...prev,
        [diaActual]: [...prev[diaActual], nuevaComida]
      }));
      
      setComidaForm({ nombre: '', orden: 1 });
    }
  };

  const addAlimento = () => {
    if (alimentoForm.alimento_id && alimentoForm.cantidad_gramos && comidaSeleccionada) {
      const nuevoAlimento = {
        alimento_id: alimentoForm.alimento_id,
        alimento_nombre: alimentoForm.alimento_nombre,
        cantidad_gramos: parseFloat(alimentoForm.cantidad_gramos)
      };
      
      setDiasComidas(prev => ({
        ...prev,
        [diaActual]: prev[diaActual].map(comida => 
          comida.id === comidaSeleccionada.id 
            ? { ...comida, alimentos: [...comida.alimentos, nuevoAlimento] }
            : comida
        )
      }));
      
      setAlimentoForm({
        alimento_id: null,
        alimento_nombre: '',
        cantidad_gramos: ''
      });
    }
  };

  const removeComida = (dia, comidaId) => {
    setDiasComidas(prev => ({
      ...prev,
      [dia]: prev[dia].filter(comida => comida.id !== comidaId)
    }));
  };

  const removeAlimento = (dia, comidaId, alimentoIndex) => {
    setDiasComidas(prev => ({
      ...prev,
      [dia]: prev[dia].map(comida => 
        comida.id === comidaId 
          ? { ...comida, alimentos: comida.alimentos.filter((_, i) => i !== alimentoIndex) }
          : comida
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const alumnoId = dietaData.alumno_id || null;
      
      const dietaResponse = await dietasAPI.create(alumnoId, {
        nombre: dietaData.nombre,
        fecha_inicio: new Date().toISOString(),
        notas: dietaData.notas
      });

      // Add meals by menu
      for (const [menu, comidas] of Object.entries(diasComidas)) {
        for (const comida of comidas) {
          const comidaResponse = await dietasAPI.addComida(dietaResponse.data.id, {
            nombre: comida.nombre,
            dia: parseInt(menu),
            orden: comida.orden
          });

          // Add foods to meal
          for (const alimento of comida.alimentos) {
            await dietasAPI.addAlimento(comidaResponse.data.id, {
              alimento_id: alimento.alimento_id,
              cantidad_gramos: alimento.cantidad_gramos
            });
          }
        }
      }

      navigate('/dietas');
    } catch (error) {
      console.error('Error creating dieta:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Dieta</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Información de la Dieta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre de la dieta"
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={dietaData.nombre}
                onChange={(e) => setDietaData({ ...dietaData, nombre: e.target.value })}
                required
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={dietaData.alumno_id}
                onChange={(e) => setDietaData({ ...dietaData, alumno_id: e.target.value })}
              >
                <option value="">Sin asignar a alumno</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>{alumno.nombre}</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Notas generales de la dieta"
              className="w-full mt-4 border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              value={dietaData.notas}
              onChange={(e) => setDietaData({ ...dietaData, notas: e.target.value })}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Configurar Comidas por Día</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cantidad de menús:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
                value={totalMenus}
                onChange={(e) => setTotalMenus(parseInt(e.target.value))}
              >
                {[1,2,3,4,5,6,7].map(num => (
                  <option key={num} value={num}>{num} menú{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Seleccionar menú:</label>
              <div className="flex space-x-2">
                {Array.from({ length: totalMenus }, (_, i) => i + 1).map(menu => (
                  <button
                    key={menu}
                    type="button"
                    onClick={() => setDiaActual(menu)}
                    className={`px-4 py-2 rounded-lg ${
                      diaActual === menu 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Menú {menu}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Agregar comida al Menú {diaActual}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Nombre de la comida:</label>
                  <input
                    type="text"
                    placeholder="Desayuno, Almuerzo, etc."
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                    value={comidaForm.nombre}
                    onChange={(e) => setComidaForm({ ...comidaForm, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Orden de la comida:</label>
                  <input
                    type="number"
                    placeholder="1"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                    value={comidaForm.orden}
                    onChange={(e) => setComidaForm({ ...comidaForm, orden: parseInt(e.target.value) })}
                  />
                </div>
                <button
                  type="button"
                  onClick={addComida}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Agregar Comida
                </button>
              </div>

              {diasComidas[diaActual]?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Seleccionar comida para agregar alimentos:</h4>
                  <div className="flex space-x-2 mb-4">
                    {diasComidas[diaActual].map(comida => (
                      <button
                        key={comida.id}
                        type="button"
                        onClick={() => setComidaSeleccionada(comida)}
                        className={`px-3 py-1 rounded text-sm ${
                          comidaSeleccionada?.id === comida.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {comida.nombre}
                      </button>
                    ))}
                  </div>

                  {comidaSeleccionada && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <AlimentoSelector
                          onSelect={(alimento) => setAlimentoForm({
                            ...alimentoForm,
                            alimento_id: alimento.id,
                            alimento_nombre: alimento.nombre
                          })}
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="Cantidad (gramos)"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={alimentoForm.cantidad_gramos}
                        onChange={(e) => setAlimentoForm({ ...alimentoForm, cantidad_gramos: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={addAlimento}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Agregar Alimento
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {Object.keys(diasComidas).some(dia => diasComidas[dia].length > 0) && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Vista Previa de la Dieta</h2>
              <div className="space-y-6">
                {Object.entries(diasComidas).map(([dia, comidas]) => (
                  comidas.length > 0 && (
                    <div key={dia} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 text-purple-600">Menú {dia}</h3>
                      <div className="space-y-4">
                        {comidas.map((comida) => (
                          <div key={comida.id} className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-purple-800">{comida.nombre}</h4>
                              <button
                                type="button"
                                onClick={() => removeComida(dia, comida.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="space-y-2">
                              {comida.alimentos.map((alimento, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                                  <span>{alimento.alimento_nombre} - {alimento.cantidad_gramos}g</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAlimento(dia, comida.id, index)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                              {comida.alimentos.length === 0 && (
                                <p className="text-gray-500 text-sm">No hay alimentos en esta comida</p>
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
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={!dietaData.nombre}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Crear Dieta
            </button>
            <button
              type="button"
              onClick={() => navigate('/dietas')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateStandaloneDieta;