import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rutinasAPI } from '../utils/api';
import Layout from '../components/Layout';
import CopyDayModal from '../components/CopyDayModal';
import SuccessModal from '../components/SuccessModal';

const ViewRutina = () => {
  const { rutinaId } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [diasEntrenamiento, setDiasEntrenamiento] = useState({});
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchRutina();
  }, [rutinaId]);

  const fetchRutina = async () => {
    try {
      const response = await rutinasAPI.getById(rutinaId);
      const rutinaData = response.data;
      setRutina(rutinaData);
      
      // Organizar ejercicios por día
      const dias = {};
      for (let i = 1; i <= rutinaData.entrenamientos_semana; i++) {
        dias[i] = [];
      }
      
      rutinaData.ejercicios.forEach(ejercicio => {
        const dia = ejercicio.dia || 1;
        if (dias[dia]) {
          dias[dia].push({
            ...ejercicio,
            ejercicio_nombre: ejercicio.ejercicio_base.nombre
          });
        }
      });
      
      setDiasEntrenamiento(dias);
    } catch (error) {
      console.error('Error fetching rutina:', error);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await rutinasAPI.downloadPDF(rutinaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rutina_${rutina.nombre}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await rutinasAPI.downloadExcel(rutinaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rutina_${rutina.nombre}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  const saveAsTemplate = async () => {
    try {
      await rutinasAPI.saveAsTemplate(rutinaId);
      setSuccessMessage({
        title: '¡Plantilla Guardada!',
        message: 'La rutina se ha guardado exitosamente como plantilla y estará disponible para crear nuevas rutinas.'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  if (!rutina) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Rutina: {rutina.nombre}</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/rutinas/${rutinaId}/edit`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => setShowCopyModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Copiar Día
            </button>
            <button
              onClick={downloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              PDF
            </button>
            <button
              onClick={downloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Excel
            </button>
            <button
              onClick={saveAsTemplate}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Plantilla
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Volver
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información de la Rutina</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Alumno</p>
              <p className="font-semibold">{rutina.alumno ? rutina.alumno.nombre : 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de inicio</p>
              <p className="font-semibold">
                {rutina.fecha_inicio ? new Date(rutina.fecha_inicio).toLocaleDateString() : 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Entrenamientos por semana</p>
              <p className="font-semibold">{rutina.entrenamientos_semana}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold">
                <span className={`px-2 py-1 rounded text-xs ${rutina.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {rutina.activa ? 'Activa' : 'Inactiva'}
                </span>
              </p>
            </div>
          </div>
          {rutina.notas && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Notas</p>
              <p className="font-semibold">{rutina.notas}</p>
            </div>
          )}
        </div>

        {Object.keys(diasEntrenamiento).some(dia => diasEntrenamiento[dia].length > 0) && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Rutina por Días</h2>
            <div className="space-y-6">
              {Object.entries(diasEntrenamiento).map(([dia, ejercicios]) => (
                ejercicios.length > 0 && (
                  <div key={dia} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-blue-600">Día {dia}</h3>
                    <div className="space-y-2">
                      {ejercicios.map((ejercicio, index) => (
                        <div key={ejercicio.id} className="p-3 bg-gray-50 rounded">
                          <h4 className="font-medium">{ejercicio.ejercicio_nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {ejercicio.series} series × {ejercicio.repeticiones} reps
                            {ejercicio.peso && ` × ${ejercicio.peso}kg`}
                            {ejercicio.descanso && ` - Descanso: ${ejercicio.descanso}s`}
                          </p>
                          {ejercicio.notas && ejercicio.notas.replace(`Día ${dia}: `, '') && (
                            <p className="text-sm text-gray-500">{ejercicio.notas.replace(`Día ${dia}: `, '')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {Object.keys(diasEntrenamiento).every(dia => diasEntrenamiento[dia].length === 0) && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Esta rutina no tiene ejercicios asignados</p>
          </div>
        )}
        
        <CopyDayModal
          isOpen={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          rutinaId={rutinaId}
          onSuccess={fetchRutina}
        />
        
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

export default ViewRutina;