import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dietasAPI, alimentosAPI } from '../utils/api';
import Layout from '../components/Layout';

const EditDieta = () => {
  const { dietaId } = useParams();
  const navigate = useNavigate();
  const [dieta, setDieta] = useState(null);
  const [showComidaForm, setShowComidaForm] = useState(false);
  const [comidaForm, setComidaForm] = useState({ nombre: '', orden: 1 });
  const [selectedComida, setSelectedComida] = useState(null);
  const [alimentoForm, setAlimentoForm] = useState({
    alimento_id: '',
    cantidad_gramos: '',
    alimento_nombre: ''
  });
  const [editingComida, setEditingComida] = useState(null);
  const [editComidaForm, setEditComidaForm] = useState({ nombre: '' });
  const [alimentos, setAlimentos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateAlimento, setShowCreateAlimento] = useState(false);
  const [newAlimentoForm, setNewAlimentoForm] = useState({
    nombre: '',
    calorias_100g: '',
    proteinas_100g: '',
    carbohidratos_100g: '',
    grasas_100g: ''
  });

  useEffect(() => {
    fetchDieta();
  }, [dietaId]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchAlimentos();
    } else if (searchQuery.length === 0) {
      setAlimentos([]);
    }
  }, [searchQuery]);

  const fetchDieta = async () => {
    try {
      const response = await dietasAPI.getById(dietaId);
      setDieta(response.data);
    } catch (error) {
      console.error('Error fetching dieta:', error);
    }
  };

  const searchAlimentos = async () => {
    try {
      const response = await alimentosAPI.search(searchQuery);
      setAlimentos(response.data);
    } catch (error) {
      console.error('Error searching alimentos:', error);
    }
  };

  const createAlimento = async () => {
    try {
      const response = await alimentosAPI.create({
        nombre: newAlimentoForm.nombre,
        calorias_100g: parseFloat(newAlimentoForm.calorias_100g),
        proteinas_100g: parseFloat(newAlimentoForm.proteinas_100g),
        carbohidratos_100g: parseFloat(newAlimentoForm.carbohidratos_100g),
        grasas_100g: parseFloat(newAlimentoForm.grasas_100g)
      });
      
      setAlimentoForm({
        alimento_id: response.data.id,
        cantidad_gramos: alimentoForm.cantidad_gramos,
        alimento_nombre: response.data.nombre
      });
      
      setNewAlimentoForm({
        nombre: '',
        calorias_100g: '',
        proteinas_100g: '',
        carbohidratos_100g: '',
        grasas_100g: ''
      });
      
      setShowCreateAlimento(false);
      setSearchQuery(response.data.nombre);
    } catch (error) {
      console.error('Error creating alimento:', error);
    }
  };

  const addComida = async () => {
    if (!comidaForm.nombre) return;
    
    try {
      await dietasAPI.addComida(dietaId, comidaForm);
      setComidaForm({ nombre: '', orden: 1 });
      setShowComidaForm(false);
      fetchDieta();
    } catch (error) {
      console.error('Error adding comida:', error);
    }
  };

  const addAlimentoToComida = async () => {
    if (!alimentoForm.alimento_id || !alimentoForm.cantidad_gramos || !selectedComida) return;
    
    try {
      await dietasAPI.addAlimentoToComida(selectedComida, {
        alimento_id: parseInt(alimentoForm.alimento_id),
        cantidad_gramos: parseFloat(alimentoForm.cantidad_gramos)
      });
      setAlimentoForm({ alimento_id: '', cantidad_gramos: '', alimento_nombre: '' });
      setSearchQuery('');
      setAlimentos([]);
      setSelectedComida(null);
      fetchDieta();
    } catch (error) {
      console.error('Error adding alimento:', error);
    }
  };

  const deleteComida = async (comidaId) => {
    try {
      await dietasAPI.deleteComida(comidaId);
      fetchDieta();
    } catch (error) {
      console.error('Error deleting comida:', error);
    }
  };

  const updateComida = async (comidaId) => {
    try {
      await dietasAPI.updateComida(comidaId, editComidaForm);
      setEditingComida(null);
      setEditComidaForm({ nombre: '' });
      fetchDieta();
    } catch (error) {
      console.error('Error updating comida:', error);
    }
  };

  const removeAlimento = async (comidaAlimentoId) => {
    try {
      await dietasAPI.deleteComidaAlimento(comidaAlimentoId);
      fetchDieta();
    } catch (error) {
      console.error('Error removing alimento:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Dieta: {dieta.nombre}</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Información Nutricional</h2>
              <p className="text-sm text-gray-600">
                {macros.calorias} kcal | Proteínas: {macros.proteinas}g | Carbohidratos: {macros.carbohidratos}g | Grasas: {macros.grasas}g
              </p>
            </div>
            <button
              onClick={() => setShowComidaForm(!showComidaForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Agregar Comida
            </button>
          </div>

          {showComidaForm && (
            <div className="mb-4 p-4 bg-purple-50 rounded space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la comida"
                  className="border border-gray-300 rounded px-3 py-2"
                  value={comidaForm.nombre}
                  onChange={(e) => setComidaForm({ ...comidaForm, nombre: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Orden"
                  className="border border-gray-300 rounded px-3 py-2"
                  value={comidaForm.orden}
                  onChange={(e) => setComidaForm({ ...comidaForm, orden: parseInt(e.target.value) })}
                />
              </div>
              <button
                onClick={addComida}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded"
              >
                Agregar Comida
              </button>
            </div>
          )}
        </div>

        {dieta.comidas?.map((comida) => (
          <div key={comida.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              {editingComida === comida.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded px-2 py-1"
                    value={editComidaForm.nombre}
                    onChange={(e) => setEditComidaForm({ nombre: e.target.value })}
                  />
                  <button
                    onClick={() => updateComida(comida.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingComida(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <h3 className="text-lg font-semibold">{comida.nombre}</h3>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingComida(comida.id);
                    setEditComidaForm({ nombre: comida.nombre });
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteComida(comida.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedComida(selectedComida === comida.id ? null : comida.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  {selectedComida === comida.id ? 'Cancelar' : 'Agregar Alimento'}
                </button>
              </div>
            </div>

            {selectedComida === comida.id && (
              <div className="mb-4 p-4 bg-green-50 rounded space-y-3">
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {alimentos.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                    {alimentos.map((alimento) => (
                      <div
                        key={alimento.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setAlimentoForm({
                            alimento_id: alimento.id,
                            cantidad_gramos: alimentoForm.cantidad_gramos,
                            alimento_nombre: alimento.nombre
                          });
                          setSearchQuery(alimento.nombre);
                          setAlimentos([]);
                        }}
                      >
                        {alimento.nombre} ({alimento.calorias_100g} kcal/100g)
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery.length > 2 && alimentos.length === 0 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500 mb-2">No se encontró "{searchQuery}"</p>
                    <button
                      onClick={() => {
                        setNewAlimentoForm({ ...newAlimentoForm, nombre: searchQuery });
                        setShowCreateAlimento(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Crear Alimento
                    </button>
                  </div>
                )}
                
                {showCreateAlimento && (
                  <div className="border border-blue-200 rounded p-3 bg-blue-50">
                    <h4 className="font-medium mb-2">Crear Nuevo Alimento</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nombre"
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={newAlimentoForm.nombre}
                        onChange={(e) => setNewAlimentoForm({ ...newAlimentoForm, nombre: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Calorías/100g"
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={newAlimentoForm.calorias_100g}
                        onChange={(e) => setNewAlimentoForm({ ...newAlimentoForm, calorias_100g: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Proteínas/100g"
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={newAlimentoForm.proteinas_100g}
                        onChange={(e) => setNewAlimentoForm({ ...newAlimentoForm, proteinas_100g: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Carbohidratos/100g"
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={newAlimentoForm.carbohidratos_100g}
                        onChange={(e) => setNewAlimentoForm({ ...newAlimentoForm, carbohidratos_100g: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Grasas/100g"
                        className="border border-gray-300 rounded px-2 py-1 text-sm col-span-2"
                        value={newAlimentoForm.grasas_100g}
                        onChange={(e) => setNewAlimentoForm({ ...newAlimentoForm, grasas_100g: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={createAlimento}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Crear
                      </button>
                      <button
                        onClick={() => setShowCreateAlimento(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="number"
                  step="0.1"
                  placeholder="Cantidad (gramos)"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={alimentoForm.cantidad_gramos}
                  onChange={(e) => setAlimentoForm({ ...alimentoForm, cantidad_gramos: e.target.value })}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addAlimentoToComida}
                    disabled={!alimentoForm.alimento_id || !alimentoForm.cantidad_gramos}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-2 rounded"
                  >
                    Agregar Alimento
                  </button>
                  <p className="text-xs text-gray-500 self-center">
                    Seleccionado: {alimentoForm.alimento_nombre || 'Ninguno'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {comida.alimentos?.map((ca) => (
                <div key={ca.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium">{ca.alimento.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      {ca.cantidad_gramos}g - {Math.round(ca.alimento.calorias_100g * ca.cantidad_gramos / 100)} kcal
                    </p>
                  </div>
                  <button
                    onClick={() => removeAlimento(ca.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {(!comida.alimentos || comida.alimentos.length === 0) && (
                <p className="text-gray-500 text-center py-4">No hay alimentos en esta comida</p>
              )}
            </div>
          </div>
        ))}

        {(!dieta.comidas || dieta.comidas.length === 0) && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Esta dieta no tiene comidas. Agrega una comida para comenzar.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditDieta;