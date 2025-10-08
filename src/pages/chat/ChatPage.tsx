import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { SplitButton } from 'primereact/splitbutton';
import { MenuItem } from 'primereact/menuitem';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import SalasList from '../../components/chat/SalasList';
import ChatMessages from '../../components/chat/ChatMessages';
import { SalaChat } from '../../services/chatService';
import chatService from '../../services/chatService';
import { useRef } from 'react';

const ChatPage: React.FC = () => {
  const [selectedSala, setSelectedSala] = useState<SalaChat | undefined>(undefined);
  const toast = useRef<Toast>(null);

  const handleSelectSala = (sala: SalaChat) => {
    setSelectedSala(sala);
  };

  const handleEliminarSala = () => {
    if (!selectedSala) return;

    confirmDialog({
      message: `¿Estás seguro de que deseas eliminar la sala "${selectedSala.nombre || `#${selectedSala.id_sala}`}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await chatService.enviarMensaje(
            selectedSala.id_sala,
            '⚠️ Esta sala ha sido marcada para eliminación ⚠️',
            undefined
          );
          
          // Eliminar la sala (esto eliminaría todos los mensajes también)
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/salas-chat`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ ids: [selectedSala.id_sala] })
          });
          
          toast.current?.show({
            severity: 'success',
            summary: 'Sala eliminada',
            detail: `La sala "${selectedSala.nombre || `#${selectedSala.id_sala}`}" ha sido eliminada correctamente`,
            life: 3000
          });
          
          setSelectedSala(undefined);
        } catch (error) {
          console.error('Error al eliminar sala:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la sala',
            life: 3000
          });
        }
      }
    });
  };

  const actionItems: MenuItem[] = [
    {
      label: 'Eliminar sala',
      icon: 'pi pi-trash',
      command: handleEliminarSala,
      disabled: !selectedSala
    }
  ];

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="grid">
        <div className="col-12">
          <Card>
            <div className="flex justify-content-between align-items-center mb-3">
              <h1 className="m-0">Chat</h1>
              {selectedSala && (
                <SplitButton 
                  label="Acciones" 
                  icon="pi pi-cog" 
                  model={actionItems} 
                  disabled={!selectedSala}
                />
              )}
            </div>
            <Divider />
            
            <div className="grid">
              <div className="col-12 md:col-4">
                <SalasList 
                  onSelectSala={handleSelectSala} 
                  selectedSalaId={selectedSala?.id_sala}
                />
              </div>
              <div className="col-12 md:col-8">
                <ChatMessages sala={selectedSala} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 