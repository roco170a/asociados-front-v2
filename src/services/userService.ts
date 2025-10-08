import { api } from './authService';

export interface Usuario {
  id_usuario: number;
  email: string;
  name: string | null;
  telefono?: string;
  fcm_value?: string;
  createdAt: Date;
  updatedAt: Date;
  socio?: Socio[];
}

export interface Socio {
  id_socio: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_registro: Date;
  id_usuario?: number;
}

export interface UsuarioFormData {
  email: string;
  name?: string;
  password?: string;
  telefono?: string;
  fcm_value?: string;
  socioId?: number;
}

class UserService {
  async getUsers(): Promise<Usuario[]> {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<Usuario> {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async createUser(userData: UsuarioFormData): Promise<Usuario> {
    try {
      const response = await api.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UsuarioFormData): Promise<Usuario> {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async updateFcmToken(id: number, fcm_value: string): Promise<Usuario> {
    try {
      const response = await api.patch(`/usuarios/${id}`, { fcm_value });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar token FCM para usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async getSocios(): Promise<Socio[]> {
    try {
      const response = await api.get('/socios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener socios:', error);
      throw error;
    }
  }
}

export default new UserService(); 