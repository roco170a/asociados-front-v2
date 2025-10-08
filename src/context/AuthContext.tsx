import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { User, LoginCredentials } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  var context = null;
  console.log(AuthContext);
  if (AuthContext) {
    context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
  } else {
    throw new Error('AuthContext no está definido');
  }  
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const storedUser = authService.getCurrentUser();
        
        if (storedUser && await authService.verifyToken()) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error al inicializar autenticación:', err);
        setError('Error al verificar sesión');
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 