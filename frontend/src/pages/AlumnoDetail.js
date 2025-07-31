import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { alumnosAPI, rutinasAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';

const AlumnoDetail = () => {
  const { id } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPesoForm, setShowPesoForm] = useState(false);
  const [pesoForm, setPesoForm] = useState({ peso: '' });
  const [showCobroForm, setShowCobroForm] = useState(false);
  const [cobroForm, setCobroForm] = useState({ fecha_cobro: '', notificaciones_activas: true });
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRutina, setSelectedRutina] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [targetAlumno, setTargetAlumno] = useState('');

  useEffect(() => {
    fetchData();
    fetchAlumnos();
  }, [id]);

  const fetchData = async () => {
    try {
      const [dashboardResponse, rutinasResponse] = await Promise.all([
        alumnosAPI.getDashboard(id),
        rutinasAPI.getByAlumno(id)
      ]);
      setDashboardData(dashboardResponse.data);
      setRutinas(rutinasResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const response = await alumnosAPI.getAll();
      setAlumnos(response.data.filter(alumno => alumno.id !== parseInt(id)));
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const handleAddPeso = async (e) => {
    e.preventDefault();
    try {
      await alumnosAPI.addPeso(id, { peso: parseFloat(pesoForm.peso) });
      setPesoForm({ peso: '' });
      setShowPesoForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding peso:', error);
    }
  };

  const handleUpdateCobro = async (e) => {
    e.preventDefault();
    try {
      await alumnosAPI.update(id, {
        fecha_cobro: cobroForm.fecha_cobro ? cobroForm.fecha_cobro + 'T00:00:00' : null,
        notificaciones_activas: cobroForm.notificaciones_activas
      });
      setShowCobroForm(false);
      fetchData();
    } catch (error) {
      console.error('Error updating cobro:', error);
    }
  };



  const downloadPDF = async (rutinaId) => {
    try {
      const response = await rutinasAPI.downloadPDF(rutinaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rutina_${rutinaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const downloadExcel = async (rutinaId) => {
    try {
      const response = await rutinasAPI.downloadExcel(rutinaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rutina_${rutinaId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  const handleCopyRutina = (rutina) => {
    setSelectedRutina(rutina);
    setShowCopyModal(true);
  };

  const copyRutina = async () => {
    if (!targetAlumno || !selectedRutina) return;
    
    try {
      await rutinasAPI.copy(selectedRutina.id, targetAlumno);
      setShowCopyModal(false);
      setTargetAlumno('');
      setSelectedRutina(null);
      alert('Rutina copiada exitosamente');
    } catch (error) {
      console.error('Error copying rutina:', error);
      alert('Error al copiar rutina');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  const chartData = dashboardData?.historico_pesos?.map(peso => ({
    fecha: new Date(peso.fecha).toLocaleDateString(),
    peso: peso.peso
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {dashboardData?.alumno?.nombre}
            </h1>
            <button
              onClick={() => setShowCobroForm(!showCobroForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Configurar Cobro
            </button>
          </div>

          {showCobroForm && (
            <form onSubmit={handleUpdateCobro} className="mb-4 p-4 bg-purple-50 rounded space-y-3">
              <input
                type="date"
                placeholder="Fecha de cobro"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={cobroForm.fecha_cobro}
                onChange={(e) => setCobroForm({ ...cobroForm, fecha_cobro: e.target.value })}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={cobroForm.notificaciones_activas}
                  onChange={(e) => setCobroForm({ ...cobroForm, notificaciones_activas: e.target.checked })}
                />
                <span>Notificaciones activas</span>
              </label>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded"
              >
                Actualizar
              </button>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{dashboardData?.alumno?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Edad</p>
              <p className="font-semibold">{dashboardData?.alumno?.edad} años</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Altura</p>
              <p className="font-semibold">{dashboardData?.alumno?.altura}m</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Peso Actual</p>
              <p className="font-semibold">
                {dashboardData?.alumno?.peso_actual ? `${dashboardData.alumno.peso_actual} kg` : 'No registrado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Objetivo</p>
              <p className="font-semibold">{dashboardData?.alumno?.objetivo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha Cobro</p>
              <p className="font-semibold">
                {dashboardData?.alumno?.fecha_cobro 
                  ? new Date(dashboardData.alumno.fecha_cobro).toLocaleDateString()
                  : 'No configurada'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Progreso de Peso</h2>
              <button
                onClick={() => setShowPesoForm(!showPesoForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Agregar Peso
              </button>
            </div>

            {showPesoForm && (
              <form onSubmit={handleAddPeso} className="mb-4 p-4 bg-gray-50 rounded">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Peso (kg)"
                  className="border border-gray-300 rounded px-3 py-2 mr-2"
                  value={pesoForm.peso}
                  onChange={(e) => setPesoForm({ peso: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                >
                  Agregar
                </button>
              </form>
            )}

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos de peso registrados</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Rutinas</h2>
              <Link
                to={`/alumnos/${id}/create-rutina`}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Nueva Rutina
              </Link>
            </div>

            <div className="space-y-3">
              {rutinas.map((rutina) => (
                <div key={rutina.id} className={`p-4 border rounded ${
                  rutina.activa ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{rutina.nombre}</h3>
                        {rutina.activa && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Activa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Fecha: {rutina.fecha_inicio ? new Date(rutina.fecha_inicio).toLocaleDateString() : 'No especificada'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ejercicios: {rutina.ejercicios?.length || 0} | Días: {rutina.entrenamientos_semana}
                      </p>
                      {rutina.notas && (
                        <p className="text-sm text-gray-600 mt-1">{rutina.notas}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/rutinas/${rutina.id}/view`}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </Link>
                    <Link
                      to={`/rutinas/${rutina.id}/edit`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleCopyRutina(rutina)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </button>
                    <button
                      onClick={() => downloadPDF(rutina.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => downloadExcel(rutina.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {rutinas.length === 0 && (
              <p className="text-gray-500 text-center py-8">No hay rutinas asignadas</p>
            )}
          </div>
        </div>

        {/* Modal para copiar rutina */}
        {showCopyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Copiar Rutina</h3>
              <p className="text-sm text-gray-600 mb-4">
                Copiar "{selectedRutina?.nombre}" a otro alumno:
              </p>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                value={targetAlumno}
                onChange={(e) => setTargetAlumno(e.target.value)}
              >
                <option value="">Seleccionar alumno...</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>{alumno.nombre}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={copyRutina}
                  disabled={!targetAlumno}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                >
                  Copiar
                </button>
                <button
                  onClick={() => {
                    setShowCopyModal(false);
                    setTargetAlumno('');
                    setSelectedRutina(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AlumnoDetail;