import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { 
  Socio, 
  Poliza, 
  TipoPoliza, 
  createSocio, 
  updateSocio, 
  getTiposPoliza, 
  createPoliza, 
  updatePoliza, 
  deletePoliza 
} from '../../services/socioService';

interface SocioFormProps {
  socio: Socio | null;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SocioForm: React.FC<SocioFormProps> = ({ socio, isEditing, onSave, onCancel }) => {
  const emptyPoliza: Poliza = {
    id_socio: 0,
    id_tipo_poliza: 0,
    numero_poliza: '',
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    monto: 0,
    estado: 'Activa'
  };

  const [formData, setFormData] = useState<Socio>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [tiposPoliza, setTiposPoliza] = useState<TipoPoliza[]>([]);
  const [polizaDialog, setPolizaDialog] = useState<boolean>(false);
  const [polizaData, setPolizaData] = useState<Poliza>(emptyPoliza);
  const [editingPoliza, setEditingPoliza] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [polizaSubmitted, setPolizaSubmitted] = useState<boolean>(false);

  useEffect(() => {
    loadTiposPoliza();
    
    if (isEditing && socio) {
      setFormData({
        id_socio: socio.id_socio,
        nombre: socio.nombre,
        apellido: socio.apellido,
        email: socio.email,
        telefono: socio.telefono || '',
        direccion: socio.direccion || '',
      });
      
      if (socio.polizas) {
        setPolizas([...socio.polizas]);
      }
    } else {
      resetForm();
    }
  }, [isEditing, socio]);

  const loadTiposPoliza = async () => {
    try {
      const data = await getTiposPoliza();
      setTiposPoliza(data);
    } catch (error) {
      console.error('Error al cargar tipos de póliza:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
    });
    setPolizas([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    
    if (formData.nombre && formData.apellido && formData.email) {
      try {
        let savedSocio: Socio;
        
        if (isEditing && formData.id_socio) {
          savedSocio = await updateSocio(formData.id_socio, formData);
        } else {
          savedSocio = await createSocio(formData);
        }
        
        // Si es un nuevo socio, necesitamos guardar las pólizas con el ID del socio
        if (!isEditing && polizas.length > 0) {
          const polizasPromises = polizas.map(poliza => {
            const newPoliza = { ...poliza, id_socio: savedSocio.id_socio! };
            return createPoliza(newPoliza);
          });
          
          await Promise.all(polizasPromises);
        }
        
        onSave();
      } catch (error) {
        console.error('Error al guardar socio:', error);
      }
    }
  };

  // Manejo de pólizas
  const openNewPoliza = () => {
    setPolizaData({
      ...emptyPoliza,
      id_socio: formData.id_socio || 0
    });
    setEditingPoliza(false);
    setPolizaDialog(true);
    setPolizaSubmitted(false);
  };

  const openEditPoliza = (poliza: Poliza) => {
    setPolizaData({ ...poliza });
    setEditingPoliza(true);
    setPolizaDialog(true);
    setPolizaSubmitted(false);
  };

  const hidePolizaDialog = () => {
    setPolizaDialog(false);
    setPolizaSubmitted(false);
  };

  const handlePolizaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPolizaData(prev => ({ ...prev, [name]: value }));
  };

  const handlePolizaDropdownChange = (e: { value: any, originalEvent: React.SyntheticEvent }) => {
    const { name, value } = e.originalEvent.target as HTMLSelectElement;
    setPolizaData(prev => ({ ...prev, [name]: value }));
  };

  const handlePolizaSubmit = async () => {
    setPolizaSubmitted(true);
    
    if (
      polizaData.id_tipo_poliza &&
      polizaData.numero_poliza &&
      polizaData.fecha_inicio &&
      polizaData.fecha_fin &&
      polizaData.monto
    ) {
      try {
        if (editingPoliza && polizaData.id_poliza) {
          // Si estamos editando una póliza existente
          await updatePoliza(polizaData.id_poliza, polizaData);
          
          setPolizas(polizas.map(p => 
            p.id_poliza === polizaData.id_poliza ? polizaData : p
          ));
        } else {
          // Si es una nueva póliza
          if (isEditing && formData.id_socio) {
            // Si el socio ya existe, creamos la póliza en la base de datos
            const newPoliza = { ...polizaData, id_socio: formData.id_socio };
            const savedPoliza = await createPoliza(newPoliza);
            setPolizas([...polizas, savedPoliza]);
          } else {
            // Si el socio es nuevo, solo la agregamos al estado local
            // Se guardará cuando se guarde el socio
            const newPoliza = { 
              ...polizaData, 
              id_poliza: -Math.floor(Math.random() * 1000) // ID temporal negativo
            };
            setPolizas([...polizas, newPoliza]);
          }
        }
        
        hidePolizaDialog();
      } catch (error) {
        console.error('Error al guardar póliza:', error);
      }
    }
  };

  const confirmDeletePoliza = async (poliza: Poliza) => {
    try {
      if (isEditing && poliza.id_poliza && poliza.id_poliza > 0) {
        // Si el socio ya existe y la póliza tiene un ID válido, la eliminamos de la BD
        await deletePoliza(poliza.id_poliza);
      }
      
      // Eliminamos la póliza del estado local
      setPolizas(polizas.filter(p => p.id_poliza !== poliza.id_poliza));
    } catch (error) {
      console.error('Error al eliminar póliza:', error);
    }
  };

  const actionBodyTemplate = (rowData: Poliza) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          rounded 
          outlined 
          className="mr-2" 
          onClick={() => openEditPoliza(rowData)} 
        />
        <Button 
          icon="pi pi-trash" 
          rounded 
          outlined 
          severity="danger" 
          onClick={() => confirmDeletePoliza(rowData)} 
        />
      </div>
    );
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const dateBodyTemplate = (rowData: Poliza, field: keyof Poliza) => {
    return formatDate(rowData[field] as Date | string);
  };

  const tipoPolizaBodyTemplate = (rowData: Poliza) => {
    const tipo = tiposPoliza.find(t => t.id_tipo_poliza === rowData.id_tipo_poliza);
    return tipo ? tipo.nombre : '';
  };

  return (
    <div>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Información del Socio">
          <div className="field">
            <label htmlFor="nombre">Nombre*</label>
            <InputText 
              id="nombre" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleInputChange} 
              required 
              className={submitted && !formData.nombre ? 'p-invalid' : ''}
            />
            {submitted && !formData.nombre && <small className="p-error">Nombre es requerido.</small>}
          </div>
          
          <div className="field">
            <label htmlFor="apellido">Apellido*</label>
            <InputText 
              id="apellido" 
              name="apellido" 
              value={formData.apellido} 
              onChange={handleInputChange} 
              required 
              className={submitted && !formData.apellido ? 'p-invalid' : ''}
            />
            {submitted && !formData.apellido && <small className="p-error">Apellido es requerido.</small>}
          </div>
          
          <div className="field">
            <label htmlFor="email">Email*</label>
            <InputText 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
              className={submitted && !formData.email ? 'p-invalid' : ''}
            />
            {submitted && !formData.email && <small className="p-error">Email es requerido.</small>}
          </div>
          
          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <InputText 
              id="telefono" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="field">
            <label htmlFor="direccion">Dirección</label>
            <InputText 
              id="direccion" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleInputChange} 
            />
          </div>
        </TabPanel>
        
        <TabPanel header="Pólizas">
          <div className="flex justify-content-end mb-2">
            <Button 
              label="Nueva Póliza" 
              icon="pi pi-plus" 
              onClick={openNewPoliza} 
            />
          </div>
          
          <DataTable 
            value={polizas} 
            responsiveLayout="scroll"
            emptyMessage="No hay pólizas asignadas"
          >
            <Column field="numero_poliza" header="Número" sortable />
            <Column field="id_tipo_poliza" header="Tipo" body={tipoPolizaBodyTemplate} sortable />
            <Column field="fecha_inicio" header="Fecha Inicio" body={(rowData) => dateBodyTemplate(rowData, 'fecha_inicio')} sortable />
            <Column field="fecha_fin" header="Fecha Fin" body={(rowData) => dateBodyTemplate(rowData, 'fecha_fin')} sortable />
            <Column field="monto" header="Monto" sortable />
            <Column field="estado" header="Estado" sortable />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '8rem' }} />
          </DataTable>
        </TabPanel>
      </TabView>
      
      <div className="flex justify-content-end mt-4 gap-2">
        <Button label="Cancelar" icon="pi pi-times" outlined onClick={onCancel} />
        <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} />
      </div>
      
      {/* Diálogo para crear/editar póliza */}
      <Dialog 
        visible={polizaDialog} 
        style={{ width: '450px' }} 
        header={editingPoliza ? 'Editar Póliza' : 'Nueva Póliza'} 
        modal 
        className="p-fluid" 
        onHide={hidePolizaDialog}
      >
        <div className="field">
          <label htmlFor="id_tipo_poliza">Tipo de Póliza*</label>
          <Dropdown 
            id="id_tipo_poliza" 
            name="id_tipo_poliza"
            value={polizaData.id_tipo_poliza} 
            options={tiposPoliza} 
            onChange={(e) => setPolizaData({...polizaData, id_tipo_poliza: e.value})}
            optionLabel="nombre" 
            optionValue="id_tipo_poliza"
            placeholder="Seleccione un tipo de póliza" 
            className={polizaSubmitted && !polizaData.id_tipo_poliza ? 'p-invalid' : ''}
          />
          {polizaSubmitted && !polizaData.id_tipo_poliza && <small className="p-error">Tipo de póliza es requerido.</small>}
        </div>
        
        <div className="field">
          <label htmlFor="numero_poliza">Número de Póliza*</label>
          <InputText 
            id="numero_poliza" 
            name="numero_poliza" 
            value={polizaData.numero_poliza} 
            onChange={handlePolizaInputChange} 
            required 
            className={polizaSubmitted && !polizaData.numero_poliza ? 'p-invalid' : ''}
          />
          {polizaSubmitted && !polizaData.numero_poliza && <small className="p-error">Número de póliza es requerido.</small>}
        </div>
        
        <div className="field">
          <label htmlFor="fecha_inicio">Fecha de Inicio*</label>
          <Calendar 
            id="fecha_inicio" 
            value={typeof polizaData.fecha_inicio === 'string' ? new Date(polizaData.fecha_inicio) : polizaData.fecha_inicio} 
            onChange={(e) => setPolizaData({...polizaData, fecha_inicio: e.value as Date})} 
            dateFormat="dd/mm/yy" 
            className={polizaSubmitted && !polizaData.fecha_inicio ? 'p-invalid' : ''}
          />
          {polizaSubmitted && !polizaData.fecha_inicio && <small className="p-error">Fecha de inicio es requerida.</small>}
        </div>
        
        <div className="field">
          <label htmlFor="fecha_fin">Fecha de Fin*</label>
          <Calendar 
            id="fecha_fin" 
            value={typeof polizaData.fecha_fin === 'string' ? new Date(polizaData.fecha_fin) : polizaData.fecha_fin} 
            onChange={(e) => setPolizaData({...polizaData, fecha_fin: e.value as Date})} 
            dateFormat="dd/mm/yy" 
            className={polizaSubmitted && !polizaData.fecha_fin ? 'p-invalid' : ''}
          />
          {polizaSubmitted && !polizaData.fecha_fin && <small className="p-error">Fecha de fin es requerida.</small>}
        </div>
        
        <div className="field">
          <label htmlFor="monto">Monto*</label>
          <InputNumber 
            id="monto" 
            value={polizaData.monto} 
            onValueChange={(e) => setPolizaData({...polizaData, monto: e.value || 0})} 
            mode="decimal" 
            minFractionDigits={2} 
            maxFractionDigits={2} 
            className={polizaSubmitted && !polizaData.monto ? 'p-invalid' : ''}
          />
          {polizaSubmitted && !polizaData.monto && <small className="p-error">Monto es requerido.</small>}
        </div>
        
        <div className="field">
          <label htmlFor="estado">Estado*</label>
          <Dropdown 
            id="estado" 
            value={polizaData.estado} 
            options={['Activa', 'Inactiva', 'Vencida', 'Cancelada']} 
            onChange={(e) => setPolizaData({...polizaData, estado: e.value})} 
            placeholder="Seleccione un estado" 
          />
        </div>
        
        <div className="flex justify-content-end mt-4 gap-2">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={hidePolizaDialog} />
          <Button label="Guardar" icon="pi pi-check" onClick={handlePolizaSubmit} />
        </div>
      </Dialog>
    </div>
  );
};

export default SocioForm; 