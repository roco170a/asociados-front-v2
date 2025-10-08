import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import chatService, { SalaChat } from '../../services/chatService';
import authService from '../../services/authService';
import { Badge } from 'primereact/badge';
import { useAuth } from '../../context/AuthContext';
import { getSocios, Socio } from '../../services/socioService';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';

interface SalasListProps {
  onSelectSala: (sala: SalaChat) => void;
  selectedSalaId?: number;
}

const SalasList: React.FC<SalasListProps> = ({ onSelectSala, selectedSalaId }) => {
  const [salas, setSalas] = useState<SalaChat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewSalaDialog, setShowNewSalaDialog] = useState<boolean>(false);
  const [creatingNewSala, setCreatingNewSala] = useState<boolean>(false);
  const [nombreSala, setNombreSala] = useState<string>('');
  const [claveSala, setClaveSala] = useState<string>('');
  const [socios, setSocios] = useState<Socio[]>([]);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  
  const { user } = useAuth();


  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  };

  const cargarSalas = async () => {    
    try {
      setLoading(true);
      const data = await chatService.getSalas();
      setSalas(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setError(null);
    } catch (err) {
      setError('Error al cargar las salas de chat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSocios = async () => {
    try {
      setLoading(true);
      const data = await getSocios();
      setSocios(data);
    } catch (error) {
      showError('Error al cargar socios');
    } finally {
      setLoading(false);
    }
  };

  const viewSocioDetails = (socio: Socio) => {
    if (socio.id_socio) {
      navigate(`/socios/${socio.id_socio}`);
    }
  };

  useEffect(() => {
    cargarSalas();
    loadSocios();
    
    // Configurar un intervalo para actualizar las salas cada 10 segundos
    const intervalId = setInterval(cargarSalas, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const crearNuevaSala = async () => {
    try {
      setCreatingNewSala(true);
      
      const userId = user ? user.id_usuario : undefined;
      
      const nuevaSala = await chatService.crearSala(userId, nombreSala, claveSala);
      setSalas([nuevaSala, ...salas]);
      setShowNewSalaDialog(false);
      setNombreSala('');
      setClaveSala('');
      
      // Seleccionar automáticamente la nueva sala
      onSelectSala(nuevaSala);
    } catch (err) {
      setError('Error al crear nueva sala de chat');
      console.error(err);
    } finally {
      setCreatingNewSala(false);
    }
  };

  const renderSalaItem = (sala: SalaChat) => {
    const isSelected = sala.id_sala === selectedSalaId;
    const createdAt = new Date(sala.createdAt).toLocaleString();
    const nombreMostrado = sala.nombre || `Sala #${sala.id_sala}`;

    console.log(sala.usuario?.id_usuario);
    console.log(socios);

    return (
      <div className="col-12" key={sala.id_sala}>
        <Card 
          className={`mb-2 cursor-pointer ${isSelected ? 'border-primary border-3' : ''}`}
          onClick={() => onSelectSala(sala)}
          style={{ 
            cursor: 'pointer',
            backgroundColor: isSelected ? 'var(--surface-200)' : 'var(--surface-card)'
          }}
        >
          <div className="flex justify-content-between align-items-center">
            <div>
              <h3 className="m-0">{nombreMostrado}</h3>
              <h3 className="m-0">{sala.telefono_destino}</h3>
              <p className="text-sm text-color-secondary m-0">
                { /* sala.usuario ? `Creada por: ${sala.usuario.name || sala.usuario.email}` : 'Sala pública' */}                
                Polizas: &nbsp;
                { socios.find(socio => socio.id_usuario === sala.usuario?.id_usuario)?.polizas?.map((poliza) => (
                  <span>
                    <Badge value={poliza.numero_poliza} severity="info" onClick={() => viewSocioDetails(socios.find(socio => socio.id_usuario === sala.usuario?.id_usuario) || {} as Socio)}></Badge>                    
                    &nbsp;
                  </span>
                  
                  
                ))}

              </p>
              <p className="text-xs text-color-secondary m-0">
                Creada: {createdAt}
              </p>              
            </div>
            <div className="flex align-items-center">
              <span className="pi pi-comments text-xl mr-2"></span>
              <span className="font-bold">{sala.mensajes?.length || 0} mensajes</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <h2 className="m-0">Salas de Chat</h2>
        <Button 
          label="Nueva Sala" 
          icon="pi pi-plus" 
          onClick={() => setShowNewSalaDialog(true)}
        />
      </div>
    );
  };

  const renderDialogFooter = () => {
    return (
      <div>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          onClick={() => {
            setShowNewSalaDialog(false);
            setNombreSala('');
            setClaveSala('');
          }} 
          className="p-button-text" 
          disabled={creatingNewSala}
        />
        <Button 
          label="Crear" 
          icon="pi pi-check" 
          onClick={() => crearNuevaSala()} 
          autoFocus 
          loading={creatingNewSala}
        />
      </div>
    );
  };

  if (loading && salas.length === 0) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error && salas.length === 0) {
    return (
      <div className="p-4 border-round bg-red-100 text-red-900 mb-3">
        <i className="pi pi-exclamation-triangle mr-2"></i>
        {error}
        <Button 
          label="Reintentar" 
          icon="pi pi-refresh" 
          className="p-button-sm p-button-text mt-2" 
          onClick={cargarSalas}
        />
      </div>
    );
  }

  return (
    <div>
      <DataView
        value={salas}
        layout="list"
        itemTemplate={renderSalaItem}
        header={renderHeader()}
        emptyMessage="No hay salas de chat disponibles"
      />

      <Dialog
        header="Crear Nueva Sala de Chat"
        visible={showNewSalaDialog}
        style={{ width: '450px' }}
        modal
        footer={renderDialogFooter()}
        onHide={() => {
          setShowNewSalaDialog(false);
          setNombreSala('');
          setClaveSala('');
        }}
      >
        <div className="flex flex-column gap-3 mt-3">
          <div className="p-field">
            <label htmlFor="nombre" className="font-bold block mb-2">Nombre de la sala</label>
            <InputText
              id="nombre"
              value={nombreSala}
              onChange={(e) => setNombreSala(e.target.value)}
              placeholder="Ingresa un nombre para la sala"
              className="w-full"
            />
          </div>
          
          <div className="p-field">
            <label htmlFor="clave" className="font-bold block mb-2">Clave de acceso (opcional)</label>
            <Password
              id="clave"
              value={claveSala}
              onChange={(e) => setClaveSala(e.target.value)}
              placeholder="Ingresa una clave si deseas proteger la sala"
              toggleMask
              className="w-full"
              feedback={false}
            />
            <small className="text-color-secondary">Deja en blanco para una sala pública</small>
          </div>
          
          <p className="text-sm text-color-secondary mt-3">
            La sala estará asociada a tu cuenta y podrás enviar mensajes inmediatamente.
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default SalasList; 