import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Socio, getSocios, deleteSocio } from '../../services/socioService';
import SocioForm from './SocioForm';
import { useNavigate } from 'react-router-dom';

const SociosPage: React.FC = () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSocios();
  }, []);

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

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  };

  const openNew = () => {
    setSelectedSocio(null);
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = (socio: Socio) => {
    setSelectedSocio(socio);
    setIsEditing(true);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const confirmDelete = (socio: Socio) => {
    confirmDialog({
      message: `¿Está seguro de eliminar al socio ${socio.nombre} ${socio.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => handleDelete(socio)
    });
  };

  const handleDelete = async (socio: Socio) => {
    try {
      if (socio.id_socio) {
        await deleteSocio(socio.id_socio);
        setSocios(socios.filter(s => s.id_socio !== socio.id_socio));
        showSuccess('Socio eliminado correctamente');
      }
    } catch (error) {
      showError('Error al eliminar socio');
    }
  };

  const onSave = () => {
    hideDialog();
    loadSocios();
  };

  const actionBodyTemplate = (rowData: Socio) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-eye" 
          rounded 
          outlined 
          className="mr-2" 
          onClick={() => viewSocioDetails(rowData)} 
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          icon="pi pi-pencil" 
          rounded 
          outlined 
          className="mr-2" 
          onClick={() => openEdit(rowData)} 
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          icon="pi pi-trash" 
          rounded 
          outlined 
          severity="danger" 
          onClick={() => confirmDelete(rowData)} 
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const viewSocioDetails = (socio: Socio) => {
    if (socio.id_socio) {
      navigate(`/socios/${socio.id_socio}`);
    }
  };

  const polizasBodyTemplate = (rowData: Socio) => {
    const count = rowData.polizas?.length || 0;
    return (
      <span className="p-badge p-component p-badge-info">{count}</span>
    );
  };

  const header = (
    <div className="flex flex-wrap justify-content-between align-items-center gap-2">
      <h2 className="m-0">Gestión de Socios</h2>
      <Button label="Nuevo Socio" icon="pi pi-plus" onClick={openNew} />
    </div>
  );

  const dialogHeader = () => {
    return isEditing ? 'Editar Socio' : 'Nuevo Socio';
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <DataTable 
        value={socios} 
        paginator 
        rows={10} 
        rowsPerPageOptions={[5, 10, 25]} 
        dataKey="id_socio"
        loading={loading}
        header={header}
        emptyMessage="No se encontraron socios"
        responsiveLayout="scroll"
      >
        <Column field="id_socio" header="ID" sortable style={{ width: '5%' }} />
        <Column field="nombre" header="Nombre" sortable style={{ width: '20%' }} />
        <Column field="apellido" header="Apellido" sortable style={{ width: '20%' }} />
        <Column field="email" header="Email" sortable style={{ width: '25%' }} />
        <Column field="telefono" header="Teléfono" style={{ width: '15%' }} />
        <Column header="Pólizas" body={polizasBodyTemplate} style={{ width: '10%' }} />
        <Column body={actionBodyTemplate} exportable={false} style={{ width: '15%' }} />
      </DataTable>

      <Dialog 
        visible={dialogVisible} 
        style={{ width: '450px' }} 
        header={dialogHeader} 
        modal 
        className="p-fluid" 
        onHide={hideDialog}
      >
        <SocioForm 
          socio={selectedSocio} 
          isEditing={isEditing} 
          onSave={onSave} 
          onCancel={hideDialog} 
        />
      </Dialog>
    </div>
  );
};

export default SociosPage; 