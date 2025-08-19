import React, { useState, useEffect } from 'react';
import { emailAPI, alumnosAPI } from '../utils/api';
import Layout from '../components/Layout';

const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState('quota');
  const [alumnos, setAlumnos] = useState([]);
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [quotaForm, setQuotaForm] = useState({
    newAmount: '',
    message: ''
  });
  const [absenceForm, setAbsenceForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    message: ''
  });

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await alumnosAPI.getAll();
      setAlumnos(response.data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const handleAlumnoToggle = (alumnoId) => {
    setSelectedAlumnos(prev => 
      prev.includes(alumnoId) 
        ? prev.filter(id => id !== alumnoId)
        : [...prev, alumnoId]
    );
  };

  const selectAllAlumnos = () => {
    setSelectedAlumnos(alumnos.map(a => a.id));
  };

  const clearSelection = () => {
    setSelectedAlumnos([]);
  };

  const sendQuotaIncrease = async (e) => {
    e.preventDefault();
    try {
      await emailAPI.sendQuotaIncrease({
        alumno_ids: selectedAlumnos,
        new_amount: parseFloat(quotaForm.newAmount),
        message: quotaForm.message
      });
      alert('Emails enviados exitosamente');
      setQuotaForm({ newAmount: '', message: '' });
      setSelectedAlumnos([]);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error al enviar emails');
    }
  };

  const sendAbsenceNotice = async (e) => {
    e.preventDefault();
    try {
      await emailAPI.sendAbsenceNotice({
        alumno_ids: selectedAlumnos,
        start_date: absenceForm.startDate,
        end_date: absenceForm.endDate,
        reason: absenceForm.reason,
        message: absenceForm.message
      });
      alert('Emails enviados exitosamente');
      setAbsenceForm({ startDate: '', endDate: '', reason: '', message: '' });
      setSelectedAlumnos([]);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error al enviar emails');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Emails</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('quota')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'quota'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Incremento de Cuota
              </button>
              <button
                onClick={() => setActiveTab('absence')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'absence'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Aviso de Ausencia
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'quota' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Notificar Incremento de Cuota</h2>
                
                <form onSubmit={sendQuotaIncrease} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Cuota ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={quotaForm.newAmount}
                      onChange={(e) => setQuotaForm({ ...quotaForm, newAmount: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje Personalizado
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows="4"
                      value={quotaForm.message}
                      onChange={(e) => setQuotaForm({ ...quotaForm, message: e.target.value })}
                      placeholder="Mensaje adicional para los alumnos..."
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={selectAllAlumnos}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Seleccionar Todos
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Limpiar
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedAlumnos.length} alumnos seleccionados
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={selectedAlumnos.length === 0 || !quotaForm.newAmount}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                  >
                    Enviar Emails
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'absence' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Notificar Ausencia</h2>
                
                <form onSubmit={sendAbsenceNotice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={absenceForm.startDate}
                        onChange={(e) => setAbsenceForm({ ...absenceForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={absenceForm.endDate}
                        onChange={(e) => setAbsenceForm({ ...absenceForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={absenceForm.reason}
                      onChange={(e) => setAbsenceForm({ ...absenceForm, reason: e.target.value })}
                      placeholder="Ej: Vacaciones, Viaje de trabajo, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje Adicional
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows="4"
                      value={absenceForm.message}
                      onChange={(e) => setAbsenceForm({ ...absenceForm, message: e.target.value })}
                      placeholder="Información adicional para los alumnos..."
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={selectAllAlumnos}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Seleccionar Todos
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Limpiar
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedAlumnos.length} alumnos seleccionados
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={selectedAlumnos.length === 0 || !absenceForm.startDate || !absenceForm.endDate}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                  >
                    Enviar Emails
                  </button>
                </form>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Seleccionar Alumnos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {alumnos.map((alumno) => (
                  <label key={alumno.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedAlumnos.includes(alumno.id)}
                      onChange={() => handleAlumnoToggle(alumno.id)}
                    />
                    <span className="text-sm">{alumno.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailManagement;