import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { alumnosAPI } from '../utils/api';

const PRChart = ({ alumnoId }) => {
  const [prData, setPrData] = useState({});
  const [selectedExercise, setSelectedExercise] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPRData();
  }, [alumnoId]);

  useEffect(() => {
    const handlePRUpdate = () => {
      fetchPRData();
    };

    window.addEventListener('prUpdated', handlePRUpdate);
    return () => window.removeEventListener('prUpdated', handlePRUpdate);
  }, []);

  const fetchPRData = async () => {
    try {
      const response = await alumnosAPI.getPRChart(alumnoId);
      setPrData(response.data);
      
      // Set first exercise as default only if no exercise is selected
      const exercises = Object.keys(response.data);
      if (exercises.length > 0 && !selectedExercise) {
        setSelectedExercise(exercises[0]);
      }
      // If selected exercise no longer exists, select first available
      if (selectedExercise && !exercises.includes(selectedExercise)) {
        setSelectedExercise(exercises[0] || '');
      }
    } catch (error) {
      console.error('Error fetching PR data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando gráfico...</div>;
  }

  const exercises = Object.keys(prData);
  
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay registros de PR para mostrar
      </div>
    );
  }

  const chartData = prData[selectedExercise]?.map(record => ({
    ...record,
    fecha: new Date(record.fecha).toLocaleDateString()
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Progreso de Personal Records</h3>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1"
        >
          {exercises.map(exercise => (
            <option key={exercise} value={exercise}>
              {exercise.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              labelFormatter={(label) => `Fecha: ${label}`}
              formatter={(value, name) => {
                if (name === 'Kgs') {
                  return [`${value}kg`, 'Kgs'];
                }
                if (name === 'Repeticiones') {
                  return [`${value} reps`, 'Repeticiones'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="peso" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Peso (kg)"
              yAxisId="left"
            />
            <Line 
              type="monotone" 
              dataKey="repeticiones" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Repeticiones"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PRChart;