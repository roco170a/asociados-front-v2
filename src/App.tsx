import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard'
import TiposServicioPage from './pages/TiposServicio'
import TiposNegocioPage from './pages/TiposNegocio'
import Navbar from './components/Navbar'
import OperadoresPage from './pages/operadores/OperadoresPage'
import LocalizadorPage from './pages/localizador/LocalizadorPage'
import ChatPage from './pages/chat/ChatPage'
import UsuariosPage from './pages/Usuarios'
import SociosPage from './pages/Socios'
import { SocioDetailPage } from './pages/Socios'

// Importa los estilos de PrimeReact
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

// Componente contenedor con la lógica de autenticación
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-ground)' }}>
      {/* Solo mostrar la barra de navegación si el usuario está autenticado */}
      {isAuthenticated && <Navbar />}
      
      <main style={{ 
        maxWidth: '6000px', 
        minHeight: '80vh', 
        margin: '0px 10px 0px 10px', 
        padding: '1rem',
        // Ajustar el padding-top cuando no hay navbar para evitar espacios vacíos
        paddingTop: isAuthenticated ? '1rem' : '0'
      }}>       
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tipos-servicio" element={<TiposServicioPage />} />
            <Route path="/tipos-negocio" element={<TiposNegocioPage />} />
            <Route path="/operadores" element={<OperadoresPage />} />
            <Route path="/localizador" element={<LocalizadorPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/socios" element={<SociosPage />} />
            <Route path="/socios/:id" element={<SocioDetailPage />} />
          </Route>
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App; 