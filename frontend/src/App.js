import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import AlumnoDetail from './pages/AlumnoDetail';
import CreateRutina from './pages/CreateRutina';
import EditRutina from './pages/EditRutina';
import ViewRutina from './pages/ViewRutina';
import SelectRutinaType from './pages/SelectRutinaType';
import SelectDietaType from './pages/SelectDietaType';
import CreateDieta from './pages/CreateDieta';
import EditDieta from './pages/EditDieta';
import ViewDieta from './pages/ViewDieta';
import AllRutinas from './pages/AllRutinas';
import AllDietas from './pages/AllDietas';
import CreateStandaloneRutina from './pages/CreateStandaloneRutina';
import CreateStandaloneDieta from './pages/CreateStandaloneDieta';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/alumnos" element={
              <ProtectedRoute>
                <Alumnos />
              </ProtectedRoute>
            } />
            <Route path="/alumnos/:id" element={
              <ProtectedRoute>
                <AlumnoDetail />
              </ProtectedRoute>
            } />
            <Route path="/alumnos/:alumnoId/select-rutina-type" element={
              <ProtectedRoute>
                <SelectRutinaType />
              </ProtectedRoute>
            } />
            <Route path="/alumnos/:alumnoId/create-rutina" element={
              <ProtectedRoute>
                <CreateRutina />
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:rutinaId/edit" element={
              <ProtectedRoute>
                <EditRutina />
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:rutinaId/view" element={
              <ProtectedRoute>
                <ViewRutina />
              </ProtectedRoute>
            } />
            <Route path="/alumnos/:alumnoId/select-dieta-type" element={
              <ProtectedRoute>
                <SelectDietaType />
              </ProtectedRoute>
            } />
            <Route path="/alumnos/:alumnoId/create-dieta" element={
              <ProtectedRoute>
                <CreateDieta />
              </ProtectedRoute>
            } />
            <Route path="/dietas/:dietaId/edit" element={
              <ProtectedRoute>
                <EditDieta />
              </ProtectedRoute>
            } />
            <Route path="/dietas/:dietaId/view" element={
              <ProtectedRoute>
                <ViewDieta />
              </ProtectedRoute>
            } />
            <Route path="/rutinas" element={
              <ProtectedRoute>
                <AllRutinas />
              </ProtectedRoute>
            } />
            <Route path="/rutinas/create" element={
              <ProtectedRoute>
                <CreateStandaloneRutina />
              </ProtectedRoute>
            } />
            <Route path="/dietas" element={
              <ProtectedRoute>
                <AllDietas />
              </ProtectedRoute>
            } />
            <Route path="/dietas/create" element={
              <ProtectedRoute>
                <CreateStandaloneDieta />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;