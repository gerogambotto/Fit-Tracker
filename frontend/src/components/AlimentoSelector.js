import React, { useState, useEffect } from 'react';
import { dietasAPI } from '../utils/api';

const AlimentoSelector = ({ onSelect }) => {
  const [alimentos, setAlimentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchAlimentos();
    } else {
      setAlimentos([]);
    }
  }, [searchTerm]);

  const searchAlimentos = async () => {
    try {
      const response = await dietasAPI.searchAlimentos(searchTerm);
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

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar alimento..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
      />
      
      {showDropdown && alimentos.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
          {alimentos.map((alimento) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default AlimentoSelector;