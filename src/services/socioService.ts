import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Socio {
  id_socio?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_registro?: Date;
  polizas?: Poliza[];
  id_usuario?: number;
  foto?: string;
}

export interface Poliza {
  id_poliza?: number;
  id_socio: number;
  id_tipo_poliza: number;
  numero_poliza: string;
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
  monto: number;
  estado: string;
  tipo_poliza?: TipoPoliza;
}

export interface TipoPoliza {
  id_tipo_poliza: number;
  nombre: string;
  descripcion?: string;
}

// Obtener todos los socios
export const getSocios = async (): Promise<Socio[]> => {
  try {
    const response = await axios.get(`${API_URL}/socios`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener socios:', error);
    throw error;
  }
};

// Obtener un socio por ID
export const getSocioById = async (id: number): Promise<Socio> => {
  try {
    const response = await axios.get(`${API_URL}/socios/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener socio con ID ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo socio
export const createSocio = async (socio: Socio): Promise<Socio> => {
  try {
    const response = await axios.post(`${API_URL}/socios`, socio);
    return response.data;
  } catch (error) {
    console.error('Error al crear socio:', error);
    throw error;
  }
};

// Actualizar un socio existente
export const updateSocio = async (id: number, socio: Socio): Promise<Socio> => {
  try {
    const response = await axios.put(`${API_URL}/socios/${id}`, socio);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar socio con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un socio
export const deleteSocio = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/socios/${id}`);
  } catch (error) {
    console.error(`Error al eliminar socio con ID ${id}:`, error);
    throw error;
  }
};

// Obtener todos los tipos de póliza
export const getTiposPoliza = async (): Promise<TipoPoliza[]> => {
  try {
    const response = await axios.get(`${API_URL}/tipos-poliza`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de póliza:', error);
    throw error;
  }
};

// Crear una nueva póliza
export const createPoliza = async (poliza: Poliza): Promise<Poliza> => {
  try {
    const response = await axios.post(`${API_URL}/polizas`, poliza);
    return response.data;
  } catch (error) {
    console.error('Error al crear póliza:', error);
    throw error;
  }
};

// Actualizar una póliza existente
export const updatePoliza = async (id: number, poliza: Poliza): Promise<Poliza> => {
  try {
    const response = await axios.put(`${API_URL}/polizas/${id}`, poliza);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar póliza con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar una póliza
export const deletePoliza = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/polizas/${id}`);
  } catch (error) {
    console.error(`Error al eliminar póliza con ID ${id}:`, error);
    throw error;
  }
};

// Actualizar la foto de un socio usando base64
export const updateSocioPhoto = async (id: number, fotoBase64: string): Promise<Socio> => {
  try {
    const response = await axios.post(`${API_URL}/socios/${id}/foto`, {
      foto: fotoBase64
    });
    return response.data.socio;
  } catch (error) {
    console.error(`Error al actualizar la foto del socio con ID ${id}:`, error);
    throw error;
  }
}; 