import React, { useState, useEffect } from 'react';
import { lesionesAPI } from '../utils/api';

const LesionesSection = ({ alumnoId }) => {
  const [lesiones, setLesiones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLesion, setEditingLesion] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    es_cronica: false,
    fecha_inicio: '',
    fecha_fin: ''
  });

  useEffect(() => {
    fetchLesiones();
  }, [alumnoId]);

  const fetchLesiones = async () => {
    try {
      const response = await lesionesAPI.getByAlumno(alumnoId);
      setLesiones(response.data);
    } catch (error) {
      console.error('Error fetching lesiones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLesion) {
        await lesionesAPI.update(editingLesion.id, formData);
      } else {
        await lesionesAPI.create(alumnoId, formData);
      }
      resetForm();
      fetchLesiones();
    } catch (error) {
      console.error('Error saving lesion:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      es_cronica: false,
      fecha_inicio: '',
      fecha_fin: ''
    });
    setShowForm(false);
    setEditingLesion(null);
  };

  const editLesion = (lesion) => {
    setFormData({
      nombre: lesion.nombre || '',
      descripcion: lesion.descripcion || '',
      es_cronica: lesion.es_cronica || false,
      fecha_inicio: lesion.fecha_inicio ? lesion.fecha_inicio.split('T')[0] : '',
      fecha_fin: lesion.fecha_fin ? lesion.fecha_fin.split('T')[0] : ''
    });
    setEditingLesion(lesion);
    setShowForm(true);
  };

  const deleteLesion = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta lesión?')) {
      try {
        await lesionesAPI.delete(id);
        fetchLesiones();
      } catch (error) {
        console.error('Error deleting lesion:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lesiones y Patologías</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          {showForm ? 'Cancelar' : 'Agregar Lesión'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-red-50 rounded space-y-3">
          <input
            type="text"
            placeholder="Nombre de la lesión"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <textarea
            placeholder="Descripción"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows="3"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              placeholder="Fecha inicio"
              className="border border-gray-300 rounded px-3 py-2"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            />
            <input
              type="date"
              placeholder="Fecha fin"
              className="border border-gray-300 rounded px-3 py-2"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.es_cronica}
              onChange={(e) => setFormData({ ...formData, es_cronica: e.target.checked })}
            />
            <span>Lesión crónica</span>
          </label>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
            >
              {editingLesion ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {lesiones.length > 0 ? (
          lesiones.map((lesion) => (
            <div key={lesion.id} className="p-3 border border-gray-200 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{lesion.nombre}</h4>
                    {lesion.es_cronica && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Crónica
                      </span>
                    )}
                    {!lesion.activa && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        Inactiva
                      </span>
                    )}
                  </div>
                  {lesion.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{lesion.descripcion}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {lesion.fecha_inicio && (
                      <span>Inicio: {new Date(lesion.fecha_inicio).toLocaleDateString()}</span>
                    )}
                    {lesion.fecha_fin && (
                      <span className="ml-2">Fin: {new Date(lesion.fecha_fin).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => editLesion(lesion)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteLesion(lesion.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No hay lesiones registradas</p>
        )}
      </div>
    </div>
  );
};

export default LesionesSection;