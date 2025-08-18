import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { alumnosAPI, rutinasAPI, dietasAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import PRChart from '../components/PRChart';
import SuccessModal from '../components/SuccessModal';

const AlumnoDetail = () => {
  const { id } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPesoForm, setShowPesoForm] = useState(false);
  const [pesoForm, setPesoForm] = useState({ peso: '' });
  const [showCobroForm, setShowCobroForm] = useState(false);
  const [cobroForm, setCobroForm] = useState({ fecha_cobro: '', notificaciones_activas: true });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: '', altura: '', objetivo: '' });
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRutina, setSelectedRutina] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [targetAlumno, setTargetAlumno] = useState('');
  const [showPRForm, setShowPRForm] = useState(false);
  const [prForm, setPrForm] = useState({ ejercicio: '', peso: '', repeticiones: 1 });
  const [showAllPRs, setShowAllPRs] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchData();
    fetchAlumnos();
  }, [id]);

  useEffect(() => {
    if (dashboardData?.alumno) {
      setEditForm({
        nombre: dashboardData.alumno.nombre || '',
        altura: dashboardData.alumno.altura || '',
        objetivo: dashboardData.alumno.objetivo || ''
      });
    }
  }, [dashboardData]);

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

  const handleUpdateAlumno = async (e) => {
    e.preventDefault();
    try {
      await alumnosAPI.update(id, {
        nombre: editForm.nombre,
        altura: parseFloat(editForm.altura),
        objetivo: editForm.objetivo
      });
      setShowEditForm(false);
      fetchData();
    } catch (error) {
      console.error('Error updating alumno:', error);
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

  const saveAsTemplate = async (rutinaId) => {
    try {
      await rutinasAPI.saveAsTemplate(rutinaId);
      setSuccessMessage({
        title: '¡Plantilla Guardada!',
        message: 'La rutina se ha guardado exitosamente como plantilla y estará disponible para crear nuevas rutinas.'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al guardar plantilla');
    }
  };

  const handleAddPR = async (e) => {
    e.preventDefault();
    try {
      await alumnosAPI.addPersonalRecord(id, {
        ejercicio: prForm.ejercicio,
        peso: parseFloat(prForm.peso),
        repeticiones: parseInt(prForm.repeticiones)
      });
      setPrForm({ ejercicio: '', peso: '', repeticiones: 1 });
      setShowPRForm(false);
      fetchData();
      // Trigger PR chart refresh
      window.dispatchEvent(new CustomEvent('prUpdated'));
    } catch (error) {
      console.error('Error adding PR:', error);
    }
  };

  const deletePR = async (prId) => {
    try {
      await alumnosAPI.deletePersonalRecord(prId);
      fetchData();
      // Trigger PR chart refresh
      window.dispatchEvent(new CustomEvent('prUpdated'));
    } catch (error) {
      console.error('Error deleting PR:', error);
    }
  };

  const saveDietaAsTemplate = async (dietaId) => {
    try {
      await dietasAPI.saveAsTemplate(dietaId);
      setSuccessMessage({
        title: '¡Plantilla Guardada!',
        message: 'La dieta se ha guardado exitosamente como plantilla y estará disponible para crear nuevas dietas.'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al guardar plantilla');
    }
  };

  const downloadDietaPDF = async (dietaId) => {
    try {
      const response = await dietasAPI.downloadPDF(dietaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dieta_${dietaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const downloadDietaExcel = async (dietaId) => {
    try {
      const response = await dietasAPI.downloadExcel(dietaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dieta_${dietaId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel:', error);
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
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Editar Datos
              </button>
              <button
                onClick={() => setShowCobroForm(!showCobroForm)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                Configurar Cobro
              </button>
            </div>
          </div>

          {showEditForm && (
            <form onSubmit={handleUpdateAlumno} className="mb-4 p-4 bg-blue-50 rounded space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Altura (m)"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={editForm.altura}
                onChange={(e) => setEditForm({ ...editForm, altura: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Objetivo"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={editForm.objetivo}
                onChange={(e) => setEditForm({ ...editForm, objetivo: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
              >
                Actualizar
              </button>
            </form>
          )}
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
                to={`/alumnos/${id}/select-rutina-type`}
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
                      {rutina.fecha_vencimiento && (
                        <p className={`text-sm ${
                          new Date(rutina.fecha_vencimiento) < new Date() 
                            ? 'text-red-600 font-semibold' 
                            : new Date(rutina.fecha_vencimiento) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            ? 'text-yellow-600 font-semibold'
                            : 'text-gray-600'
                        }`}>
                          Vence: {new Date(rutina.fecha_vencimiento).toLocaleDateString()}
                          {new Date(rutina.fecha_vencimiento) < new Date() && ' (VENCIDA)'}
                          {new Date(rutina.fecha_vencimiento) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
                           new Date(rutina.fecha_vencimiento) >= new Date() && ' (PRÓXIMA A VENCER)'}
                        </p>
                      )}
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
                    <button
                      onClick={() => toggleRutinaStatus(rutina.id, rutina.activa)}
                      className={`px-2 py-1 rounded text-xs ${
                        rutina.activa 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {rutina.activa ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => saveAsTemplate(rutina.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Plantilla
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <PRChart alumnoId={id} />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Personal Records</h2>
              <button
                onClick={() => setShowPRForm(!showPRForm)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
              >
                Agregar PR
              </button>
            </div>

          {showPRForm && (
            <form onSubmit={handleAddPR} className="mb-4 p-4 bg-orange-50 rounded space-y-3">
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={prForm.ejercicio}
                onChange={(e) => setPrForm({ ...prForm, ejercicio: e.target.value })}
                required
              >
                <option value="">Seleccionar ejercicio...</option>
                <option value="sentadilla">Sentadilla</option>
                <option value="press_militar">Press Militar</option>
                <option value="press_plano">Press Plano</option>
                <option value="peso_muerto">Peso Muerto</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Peso (kg)"
                  className="border border-gray-300 rounded px-3 py-2"
                  value={prForm.peso}
                  onChange={(e) => setPrForm({ ...prForm, peso: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Repeticiones"
                  className="border border-gray-300 rounded px-3 py-2"
                  value={prForm.repeticiones}
                  onChange={(e) => setPrForm({ ...prForm, repeticiones: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded"
              >
                Agregar PR
              </button>
            </form>
          )}

          <div className="space-y-3">
            {dashboardData?.personal_records?.length > 0 ? (
              <>
                {(showAllPRs ? dashboardData.personal_records : dashboardData.personal_records.slice(0, 4)).map((pr) => (
                  <div key={pr.id} className="p-3 border border-gray-200 rounded flex justify-between items-center">
                    <div>
                      <h4 className="font-medium capitalize">
                        {pr.ejercicio.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {pr.peso}kg × {pr.repeticiones} rep{pr.repeticiones > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pr.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePR(pr.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                {dashboardData.personal_records.length > 4 && (
                  <button
                    onClick={() => setShowAllPRs(!showAllPRs)}
                    className="w-full text-center text-blue-600 hover:text-blue-800 text-sm py-2"
                  >
                    {showAllPRs ? 'Ver menos' : `Ver más (${dashboardData.personal_records.length - 4} más)`}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay personal records registrados</p>
            )}
          </div>
        </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Dietas</h2>
            <Link
              to={`/alumnos/${id}/select-dieta-type`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Nueva Dieta
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.dietas?.length > 0 ? (
              dashboardData.dietas.map((dieta) => (
                <div key={dieta.id} className={`p-4 border rounded ${
                  dieta.activa ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{dieta.nombre}</h3>
                        {dieta.activa && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            Activa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Fecha: {dieta.fecha_inicio ? new Date(dieta.fecha_inicio).toLocaleDateString() : 'No especificada'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Comidas: {dieta.comidas?.length || 0}
                      </p>
                      {dieta.notas && (
                        <p className="text-sm text-gray-600 mt-1">{dieta.notas}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/dietas/${dieta.id}/view`}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </Link>
                    <Link
                      to={`/dietas/${dieta.id}/edit`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => downloadDietaPDF(dieta.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => downloadDietaExcel(dieta.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => saveDietaAsTemplate(dieta.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Plantilla
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay dietas asignadas</p>
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

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={successMessage.title}
          message={successMessage.message}
        />
      </div>
    </Layout>
  );
};

export default AlumnoDetail;