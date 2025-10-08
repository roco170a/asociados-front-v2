import { api } from './authService';

interface NotificationRequest {
  token?: string;
  tokens?: string[];
  topic?: string;
  titulo?: string;
  mensaje: string;
  datos?: Record<string, any>;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  result: any;
}

class NotificationService {
  async sendNotification(data: NotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await api.post('/notificaciones', data);
      return response.data;
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 