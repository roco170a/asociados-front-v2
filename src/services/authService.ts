import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface User {
  id_usuario: number;
  email: string;
  name: string | null;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Crear una instancia de axios para uso general
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/usuarios/login`, credentials);
      
      // Guardar token en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }
      
      return {
        user: response.data.usuario,
        token: response.data.token
      };
    } catch (error) {
      console.error('Error durante el login:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      const response = await api.get('/usuarios/verify-token');
      return response.status === 200;
    } catch (error) {
      this.logout(); // Si hay error, deslogueamos al usuario
      return false;
    }
  }
}

export default new AuthService(); 