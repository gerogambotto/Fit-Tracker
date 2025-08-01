import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dietasAPI, alimentosAPI } from '../utils/api';
import Layout from '../components/Layout';

const CreateDieta = () => {
  const { alumnoId } = useParams();
  const navigate = useNavigate();
  const [dietaForm, setDietaForm] = useState({
    nombre: '',
    fecha_inicio: '',
    notas: ''
  });
  const [comidas, setComidas] = useState([]);
  const [showComidaForm, setShowComidaForm] = useState(false);
  const [comidaForm, setComidaForm] = useState({ nombre: '', orden: 1 });
  const [selectedComida, setSelectedComida] = useState(null);
  const [alimentoForm, setAlimentoForm] = useState({
    alimento_id: '',
    cantidad_gramos: '',
    alimento_nombre: ''
  });
  const [alimentos, setAlimentos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchAlimentos();
    }
  }, [searchQuery]);

  const searchAlimentos = async () => {
    try {
      const response = await alimentosAPI.search(searchQuery);
      setAlimentos(response.data);
    } catch (error) {
      console.error('Error searching alimentos:', error);
    }
  };

  const createDieta = async () => {
    try {
      const response = await dietasAPI.create(alumnoId, dietaForm);
      navigate(`/dietas/${response.data.id}/edit`);
    } catch (error) {
      console.error('Error creating dieta:', error);
    }
  };

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

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información de la Dieta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre de la dieta"
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={dietaForm.nombre}
              onChange={(e) => setDietaForm({ ...dietaForm, nombre: e.target.value })}
            />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={dietaForm.fecha_inicio}
              onChange={(e) => setDietaForm({ ...dietaForm, fecha_inicio: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Notas (opcional)"
            className="w-full mt-4 border border-gray-300 rounded-lg px-3 py-2"
            rows="3"
            value={dietaForm.notas}
            onChange={(e) => setDietaForm({ ...dietaForm, notas: e.target.value })}
          />
          <button
            onClick={createDieta}
            disabled={!dietaForm.nombre}
            className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
          >
            Crear Dieta
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateDieta;