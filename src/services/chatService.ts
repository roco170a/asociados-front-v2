import { api } from './authService';

export interface SalaChat {
  id_sala: number;
  id_usuario: number | null;
  nombre: string | null;
  clave: string | null;
  telefono_destino: string | null;  
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id_usuario: number;
    email: string;
    name: string | null;
  };
  mensajes?: Mensaje[];
}

export interface Mensaje {
  id_mensaje: number;
  id_sala: number;
  id_usuario: number | null;
  texto_mensaje: string;
  createdAt: string;
  updatedAt: string;
  releaseAt: string;
  usuario?: {
    id_usuario: number;
    email: string;
    name: string | null;
  };
}

class ChatService {
  private eventSources: Map<number, EventSource> = new Map();
  private API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  async getSalas(): Promise<SalaChat[]> {
    try {
      const response = await api.get('/salas-chat');
      return response.data;
    } catch (error) {
      console.error('Error al obtener salas de chat:', error);
      throw error;
    }
  }

  async crearSala(id_usuario?: number, nombre?: string, clave?: string): Promise<SalaChat> {
    try {
      const response = await api.post('/salas-chat', { 
        id_usuario,
        nombre: nombre || null,
        clave: clave || null
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear sala de chat:', error);
      throw error;
    }
  }

  async getSala(id: number): Promise<SalaChat> {
    try {
      const response = await api.get(`/salas-chat/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener sala de chat ${id}:`, error);
      throw error;
    }
  }

  async getMensajes(idSala: number): Promise<Mensaje[]> {
    try {
      const response = await api.get(`/salas-chat/${idSala}/mensajes`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mensajes de la sala ${idSala}:`, error);
      throw error;
    }
  }

  async enviarMensaje(idSala: number, texto_mensaje: string, id_usuario?: number): Promise<Mensaje> {
    try {
      const response = await api.post(`/salas-chat/${idSala}/mensajes`, {
        texto_mensaje,
        id_usuario
      });
      return response.data;
    } catch (error) {
      console.error(`Error al enviar mensaje a la sala ${idSala}:`, error);
      throw error;
    }
  }

  // Función para configurar SSE (Server-Sent Events)
  setupSSE(idSala: number, callback: (mensajes: Mensaje[]) => void): () => void {
    // Cerrar la conexión anterior si existe
    this.closeSSE(idSala);
    
    // Obtener el token de autenticación
    const token = localStorage.getItem('token');
    
    // Crear una nueva conexión SSE
    // Nota: No podemos enviar headers personalizados con EventSource nativo
    // así que usamos la URL sin withCredentials
    const eventSource = new EventSource(
      `${this.API_URL}/salas-chat/${idSala}/mensajes/sse`
    );
    
    // Configurar el evento de mensaje
    eventSource.onmessage = (event) => {
      try {
        const mensajes = JSON.parse(event.data);
        callback(mensajes);
      } catch (error) {
        console.error('Error al procesar mensaje SSE:', error);
      }
    };
    
    // Configurar el evento de error
    eventSource.onerror = (error) => {
      console.error('Error en la conexión SSE:', error);
      this.closeSSE(idSala);
      
      // Reintentar la conexión después de un tiempo
      setTimeout(() => {
        this.setupSSE(idSala, callback);
      }, 5000);
    };
    
    // Guardar la referencia al EventSource
    this.eventSources.set(idSala, eventSource);
    
    // Devolver una función para cerrar la conexión
    return () => this.closeSSE(idSala);
  }
  
  // Función para cerrar una conexión SSE
  closeSSE(idSala: number): void {
    const eventSource = this.eventSources.get(idSala);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(idSala);
    }
  }

  // Función para configurar polling de mensajes (fallback si SSE no está disponible)
  setupPolling(idSala: number, callback: (mensajes: Mensaje[]) => void, intervalo = 3000): () => void {
    const intervalId = setInterval(async () => {
      try {
        const mensajes = await this.getMensajes(idSala);
        callback(mensajes);
      } catch (error) {
        console.error('Error en el polling de mensajes:', error);
      }
    }, intervalo);

    // Retorna una función para detener el polling
    return () => clearInterval(intervalId);
  }
}

export default new ChatService(); 