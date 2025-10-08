import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ScrollPanel } from 'primereact/scrollpanel';
import chatService, { Mensaje, SalaChat } from '../../services/chatService';
import authService from '../../services/authService';
import { Badge } from 'primereact/badge';
import { useAuth } from '../../context/AuthContext';
interface ChatMessagesProps {
  sala?: SalaChat;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ sala }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useSSE, setUseSSE] = useState<boolean>(true); // Preferir SSE por defecto
  const scrollPanelRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const { user, logout } = useAuth();

  // Cargar mensajes iniciales y configurar sincronización en tiempo real
  useEffect(() => {
    if (!sala) return;

    const cargarMensajes = async () => {
      try {
        setLoading(true);
        const data = await chatService.getMensajes(sala.id_sala);
        setMensajes(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los mensajes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarMensajes();

    // Detener la sincronización anterior si existe
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Configurar nueva sincronización para esta sala
    try {
      if (useSSE) {
        // Intentar usar SSE primero
        cleanupRef.current = chatService.setupSSE(sala.id_sala, (nuevosMensajes) => {
          setMensajes(nuevosMensajes);
        });
      } else {
        // Fallback a polling si SSE no está disponible
        cleanupRef.current = chatService.setupPolling(sala.id_sala, (nuevosMensajes) => {
          if (JSON.stringify(nuevosMensajes) !== JSON.stringify(mensajes)) {
            setMensajes(nuevosMensajes);
          }
        });
      }
    } catch (err) {
      console.error('Error al configurar sincronización en tiempo real:', err);
      // Si falla SSE, intentar con polling
      if (useSSE) {
        setUseSSE(false);
        cleanupRef.current = chatService.setupPolling(sala.id_sala, (nuevosMensajes) => {
          if (JSON.stringify(nuevosMensajes) !== JSON.stringify(mensajes)) {
            setMensajes(nuevosMensajes);
          }
        });
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [sala, useSSE]);

  // Scroll al último mensaje cuando se añaden nuevos mensajes
  useEffect(() => {
    if (scrollPanelRef.current && mensajes.length > 0) {
      const scrollPanel = scrollPanelRef.current.getElement();
      scrollPanel.scrollTop = scrollPanel.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!sala || !nuevoMensaje.trim()) return;

    try {
      setEnviando(true);
      const currentUser = user;
      const userId = currentUser ? currentUser.id_usuario : undefined;

      await chatService.enviarMensaje(sala.id_sala, nuevoMensaje, userId);
      setNuevoMensaje('');

      // No es necesario actualizar mensajes manualmente con SSE
      // pero lo hacemos por si acaso para una respuesta más rápida
      if (!useSSE) {
        const mensajesActualizados = await chatService.getMensajes(sala.id_sala);
        setMensajes(mensajesActualizados);
      }
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  if (!sala) {
    return (
      <Card className="h-full flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="pi pi-comments text-5xl text-color-secondary mb-3"></i>
          <h3>Selecciona una sala de chat</h3>
          <p className="text-color-secondary">Elige una sala de la lista para ver los mensajes</p>
        </div>
      </Card>
    );
  }

  const renderMensaje = (mensaje: Mensaje) => {
    const currentUser = user;
    const isCurrentUser = currentUser && mensaje.id_usuario === currentUser.id_usuario;
    const fecha = new Date(mensaje.createdAt).toLocaleString();

    return (
      <div style={{backgroundColor: '#ece5dd'}}
        key={mensaje.id_mensaje}
        className={`flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-2`}
      >
        <div 
          className={`p-3 ${isCurrentUser ? 'text-black' : 'bg-surface-200'}`}
          style={{            
            backgroundColor: isCurrentUser ? '#dcf8c6' : (mensaje.texto_mensaje.toUpperCase().indexOf('EMERGENCIA') > -1 ? '#f8d7da' : 'white'),
            maxWidth: '80%',
            borderRadius: isCurrentUser ? '1rem 1rem 0rem 1rem' : '1rem 1rem 1rem 0rem', 
          }}
        >
          <div className="text-xs mb-1 text-color-secondary">
            {mensaje.usuario ? (mensaje.usuario.name || mensaje.usuario.email) : 'Anónimo'} - {fecha}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{mensaje.texto_mensaje}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-column" style={{ height: '70vh' }}>
      <div className="flex justify-content-between align-items-center mb-3">
        <div className="flex align-items-center">
          <h2 className="m-0">{sala.nombre || `Sala #${sala.id_sala}`} - {sala.telefono_destino}</h2>          
        </div>
        <div className="flex align-items-center">
          {sala.usuario && (
            <span className="text-sm text-color-secondary mr-2">
              Creada por: {sala.usuario.name || sala.usuario.email}
            </span>
          )}
          <span className="text-xs p-1 bg-primary text-white border-round">
            {useSSE ? 'Tiempo real' : 'Actualización periódica'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 border-round bg-red-100 text-red-900 mb-3">
          <i className="pi pi-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      <ScrollPanel
        ref={scrollPanelRef}
        className="flex-grow-1 mb-3"
        style={{ height: '100%', width: '100%' , backgroundColor: '#ece5dd'}}
      >
        {loading && mensajes.length === 0 ? (
          <div className="flex justify-content-center align-items-center h-full">
            <ProgressSpinner />
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex justify-content-center align-items-center h-full text-color-secondary">
            <div className="text-center">
              <i className="pi pi-inbox text-4xl mb-2"></i>
              <p>No hay mensajes en esta sala</p>
              <p className="text-sm">¡Sé el primero en enviar un mensaje!</p>
            </div>
          </div>
        ) : (
          <div className="p-3" style={{backgroundColor: '#ece5dd'}}>
            {mensajes.map(renderMensaje)}
          </div>
        )}
      </ScrollPanel>

      <div className="flex" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <InputText
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-grow-1 mr-2"
          disabled={enviando}
        />
        <Button
          icon="pi pi-send"
          onClick={enviarMensaje}
          disabled={!nuevoMensaje.trim() || enviando}
          loading={enviando}
        />
      </div>

    </Card>
  );
};

export default ChatMessages; 