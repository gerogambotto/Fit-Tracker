import React, { useState, useEffect } from 'react';
import { alimentosAPI } from '../utils/api';

const AlimentoSelector = ({ onSelect }) => {
  const [alimentos, setAlimentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlimento, setNewAlimento] = useState({
    nombre: '',
    calorias_100g: '',
    proteinas_100g: '',
    carbohidratos_100g: '',
    grasas_100g: ''
  });

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchAlimentos();
    } else {
      setAlimentos([]);
    }
  }, [searchTerm]);

  const searchAlimentos = async () => {
    try {
      const response = await alimentosAPI.search(searchTerm);
      setAlimentos(response.data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching alimentos:', error);
    }
  };

  const handleSelect = (alimento) => {
    onSelect(alimento);
    setSearchTerm(alimento.nombre);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm && alimentos.length === 0) {
      e.preventDefault();
      setNewAlimento({ ...newAlimento, nombre: searchTerm });
      setShowCreateModal(true);
    }
  };

  const createAlimento = async () => {
    try {
      const response = await alimentosAPI.create(newAlimento);
      handleSelect(response.data);
      setShowCreateModal(false);
      setNewAlimento({
        nombre: '',
        calorias_100g: '',
        proteinas_100g: '',
        carbohidratos_100g: '',
        grasas_100g: ''
      });
    } catch (error) {
      console.error('Error creating alimento:', error);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar alimento..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
      />
      
      {showDropdown && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
          {alimentos.length > 0 ? (
            alimentos.map((alimento) => (
              <div
                key={alimento.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(alimento)}
              >
                <div className="font-medium">{alimento.nombre}</div>
                <div className="text-sm text-gray-600">
                  {alimento.calorias_100g} kcal/100g
                </div>
              </div>
            ))
          ) : searchTerm.length > 2 ? (
            <div className="p-2 text-gray-500">
              No encontrado. Presiona Enter para crear "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Alimento</h3>
            <input
              type="text"
              placeholder="Nombre del alimento"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              value={newAlimento.nombre}
              onChange={(e) => setNewAlimento({ ...newAlimento, nombre: e.target.value })}
            />
            <input
              type="number"
              placeholder="Calorías por 100g"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              value={newAlimento.calorias_100g}
              onChange={(e) => setNewAlimento({ ...newAlimento, calorias_100g: e.target.value })}
            />
            <input
              type="number"
              placeholder="Proteínas por 100g"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              value={newAlimento.proteinas_100g}
              onChange={(e) => setNewAlimento({ ...newAlimento, proteinas_100g: e.target.value })}
            />
            <input
              type="number"
              placeholder="Carbohidratos por 100g"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              value={newAlimento.carbohidratos_100g}
              onChange={(e) => setNewAlimento({ ...newAlimento, carbohidratos_100g: e.target.value })}
            />
            <input
              type="number"
              placeholder="Grasas por 100g"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={newAlimento.grasas_100g}
              onChange={(e) => setNewAlimento({ ...newAlimento, grasas_100g: e.target.value })}
            />
            <div className="flex space-x-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); createAlimento(); }}
                disabled={!newAlimento.nombre || !newAlimento.calorias_100g}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlimentoSelector;