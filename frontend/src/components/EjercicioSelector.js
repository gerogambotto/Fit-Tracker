import React, { useState, useEffect } from 'react';
import { ejerciciosBaseAPI } from '../utils/api';

const EjercicioSelector = React.forwardRef(({ onSelect, value }, ref) => {
  const [ejercicios, setEjercicios] = useState([]);
  const [filteredEjercicios, setFilteredEjercicios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEjercicio, setNewEjercicio] = useState({ nombre: '', categoria: '' });

  useEffect(() => {
    fetchEjercicios();
  }, []);

  const fetchEjercicios = async () => {
    try {
      const response = await ejerciciosBaseAPI.getAll();
      setEjercicios(response.data);
    } catch (error) {
      console.error('Error fetching ejercicios:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 0) {
      const filtered = ejercicios.filter(ej => 
        ej.nombre.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEjercicios(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (ejercicio) => {
    setSearchTerm(ejercicio.nombre);
    setShowSuggestions(false);
    onSelect(ejercicio);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  React.useImperativeHandle(ref, () => ({
    clearSelection
  }));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm && filteredEjercicios.length === 0) {
      e.preventDefault();
      setNewEjercicio({ ...newEjercicio, nombre: searchTerm });
      setShowCreateModal(true);
    }
  };

  const createEjercicio = async () => {
    try {
      const response = await ejerciciosBaseAPI.create(newEjercicio);
      setEjercicios([...ejercicios, response.data]);
      handleSelect(response.data);
      setShowCreateModal(false);
      setNewEjercicio({ nombre: '', categoria: '' });
    } catch (error) {
      console.error('Error creating ejercicio:', error);
    }
  };

  const categorias = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Core', 'Cardio'];

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar o escribir ejercicio..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => searchTerm && setShowSuggestions(true)}
      />

      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
          {filteredEjercicios.length > 0 ? (
            filteredEjercicios.map((ejercicio) => (
              <div
                key={ejercicio.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(ejercicio)}
              >
                <div className="font-medium">{ejercicio.nombre}</div>
                <div className="text-sm text-gray-500">{ejercicio.categoria}</div>
              </div>
            ))
          ) : searchTerm ? (
            <div className="px-3 py-2 text-gray-500">
              No encontrado. Presiona Enter para crear "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Ejercicio</h3>
            <input
              type="text"
              placeholder="Nombre del ejercicio"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={newEjercicio.nombre}
              onChange={(e) => setNewEjercicio({ ...newEjercicio, nombre: e.target.value })}
            />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={newEjercicio.categoria}
              onChange={(e) => setNewEjercicio({ ...newEjercicio, categoria: e.target.value })}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); createEjercicio(); }}
                disabled={!newEjercicio.nombre || !newEjercicio.categoria}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Crear
              </button>
              <button
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
});

export default EjercicioSelector;