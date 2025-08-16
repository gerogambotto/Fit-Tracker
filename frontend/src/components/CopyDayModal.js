import React, { useState } from 'react';
import { rutinasAPI } from '../utils/api';
import { useNotification } from '../context/NotificationContext';

const CopyDayModal = ({ isOpen, onClose, rutinaId, onSuccess }) => {
  const [sourceDay, setSourceDay] = useState(1);
  const [targetDay, setTargetDay] = useState(2);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleCopy = async () => {
    if (sourceDay === targetDay) {
      showError('El día origen y destino no pueden ser iguales');
      return;
    }

    setLoading(true);
    try {
      const response = await rutinasAPI.copyDay(rutinaId, sourceDay, targetDay);
      showSuccess(response.data.message);
      onSuccess();
      onClose();
    } catch (error) {
      showError(error.message || 'Error al copiar ejercicios');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Copiar Día de Rutina</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día origen (copiar desde):
            </label>
            <select
              value={sourceDay}
              onChange={(e) => setSourceDay(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {[1,2,3,4,5,6,7].map(day => (
                <option key={day} value={day}>Día {day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día destino (copiar hacia):
            </label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {[1,2,3,4,5,6,7].map(day => (
                <option key={day} value={day}>Día {day}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Los ejercicios del día {targetDay} serán reemplazados por los del día {sourceDay}.
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleCopy}
            disabled={loading || sourceDay === targetDay}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Copiando...' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyDayModal;