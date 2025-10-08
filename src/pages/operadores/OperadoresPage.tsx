import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';

interface TipoNegocio {
  id_tipo_negocio: number;
  nombre: string;
  descripcion: string;
}

interface Operador {
  id_operador: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  id_tipo_negocio: number;
  UbicacionLat: string;
  UbicacionLog: string;
  RFC: string;
  Pais: string;
  Estado: string;
  Delegacion: string;
  Colonia: string;
  Lada: string;
  tipo_negocio: TipoNegocio;
  tipos_servicio: {
    id_tipo_servicio: number;
    nombre: string;
  }[];
  tipos_poliza: {
    id_tipo_poliza: number; 
    nombre: string;
  }[];
}

interface FormData {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  id_tipo_negocio: number;
  UbicacionLat: string;
  UbicacionLog: string;
  RFC: string;
  Pais: string;
  Estado: string;
  Delegacion: string;
  Colonia: string;
  Lada: string;
  tipos_servicio: number[];
  tipos_poliza: number[];
}

export default function OperadoresPage() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [tiposPoliza, setTiposPoliza] = useState([]);
  const [tiposNegocio, setTiposNegocio] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentOperador, setCurrentOperador] = useState<Operador | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    id_tipo_negocio: 0,
    UbicacionLat: '',
    UbicacionLog: '',
    RFC: '',
    Pais: '',
    Estado: '',
    Delegacion: '',
    Colonia: '',
    Lada: '',
    tipos_servicio: [],
    tipos_poliza: []
  });
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const toast = useRef<Toast>(null);

  const fetchOperadores = async () => {
    try {
      const response = await fetch( `${import.meta.env.VITE_PUBLIC_API_URL}/api/operadores`);
      const data = await response.json();
      setOperadores(data);
    } catch (error) {
      console.error('Error al obtener operadores:', error);
    }
  };

  const fetchTiposServicio = async () => {
    try {
      const response = await fetch( `${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-servicio`);
      if (response.ok) {
        const data = await response.json();
        setTiposServicio(data);
      }
    } catch (error) {
      console.error('Error al obtener tipos de servicio:', error);
    }
  };

  const fetchTiposPoliza = async () => {
    try {
      const response = await fetch( `${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-poliza`);
      if (response.ok) {
        const data = await response.json();
        setTiposPoliza(data);
      }
    } catch (error) {
      console.error('Error al obtener tipos de póliza:', error);
    }
  };

  const fetchTiposNegocio = async () => {
    try {
      const response = await fetch( `${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-negocio`);
      if (response.ok) {
        const data = await response.json();
        setTiposNegocio(data);
      }
    } catch (error) {
      console.error('Error al cargar tipos de negocio:', error);
    }
  };

  useEffect(() => {
    fetchOperadores();
    fetchTiposNegocio();
    fetchTiposServicio();
    fetchTiposPoliza();
  }, []);

  const handleOpen = (operador?: Operador) => {
    if (operador) {
      setCurrentOperador(operador);
      setFormData({
        nombre: operador.nombre,
        contacto: operador.contacto,
        telefono: operador.telefono,
        email: operador.email,
        direccion: operador.direccion,
        id_tipo_negocio: operador.id_tipo_negocio,
        UbicacionLat: operador.UbicacionLat,
        UbicacionLog: operador.UbicacionLog,
        RFC: operador.RFC,
        Pais: operador.Pais,
        Estado: operador.Estado,
        Delegacion: operador.Delegacion,
        Colonia: operador.Colonia,
        Lada: operador.Lada,
        tipos_servicio: operador.tipos_servicio.map(s => s.id_tipo_servicio),
        tipos_poliza: operador.tipos_poliza.map(p => p.id_tipo_poliza)
      });
    } else {
      setCurrentOperador(null);
      setFormData({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        id_tipo_negocio: 0,
        UbicacionLat: '',
        UbicacionLog: '',
        RFC: '',
        Pais: '',
        Estado: '',
        Delegacion: '',
        Colonia: '',
        Lada: '',
        tipos_servicio: [],
        tipos_poliza: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentOperador(null);
    setFormData({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      id_tipo_negocio: 0,
      UbicacionLat: '',
      UbicacionLog: '',
      RFC: '',
      Pais: '',
      Estado: '',
      Delegacion: '',
      Colonia: '',
      Lada: '',
      tipos_servicio: [],
      tipos_poliza: []
    });
  };

  const handleSubmit = async () => {
    try {
      const url = `${import.meta.env.VITE_PUBLIC_API_URL}/api/operadores`;
      const method = currentOperador ? 'PUT' : 'POST';
      
      const body = {
        ...formData,
        id_operador: currentOperador?.id_operador,
        id_tipo_negocio: Number(formData.id_tipo_negocio),
        tipos_servicio: formData.tipos_servicio,
        tipos_poliza: formData.tipos_poliza
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: errorData.error || 'Error al guardar el operador',
          life: 3000
        });
        return;
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `Operador ${currentOperador ? 'actualizado' : 'creado'} correctamente`,
        life: 3000
      });

      handleClose();
      fetchOperadores();
    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al procesar la solicitud',
        life: 3000
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch( `${import.meta.env.VITE_PUBLIC_API_URL}/api/operadores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOperadores();
      }
    } catch (error) {
      console.error('Error al eliminar operador:', error);
    }
  };

  const actionBodyTemplate = (rowData: Operador) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info"
          onClick={() => {
            setSelectedOperador(rowData);
            setViewDialogVisible(true);
          }}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success"
          onClick={() => handleOpen(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => handleDelete(rowData.id_operador)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={handleClose} />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} />
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-3">
        <h1 className="text-2xl font-bold m-0">Operadores</h1>
        <Button label="Agregar" icon="pi pi-plus" onClick={() => handleOpen()} />
      </div>

      <DataTable value={operadores} tableStyle={{ minWidth: '50rem' }} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} stripedRows>
        <Column field="id_operador" header="ID" sortable style={{ width: '10%' }}></Column>
        <Column field="nombre" header="Nombre" sortable style={{ width: '20%' }}></Column>
        <Column field="email" header="Email" sortable style={{ width: '20%' }}></Column>
        <Column body={actionBodyTemplate} header="Acciones" style={{ width: '20%', textAlign: 'center' }}></Column>
      </DataTable>

      <Dialog
        header="Detalles del Operador"
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        style={{ width: '500px' }}
        modal
      >
        {selectedOperador && (
          <div className="grid">
            <div className="col-12">
              <h4>Información General</h4>
              <p><strong>ID:</strong> {selectedOperador.id_operador}</p>
              <p><strong>Nombre:</strong> {selectedOperador.nombre}</p>
              <p><strong>Email:</strong> {selectedOperador.email}</p>
              <p><strong>RFC:</strong> {selectedOperador.RFC}</p>
            </div>
            <div className="col-12">
              <h4>Ubicación</h4>
              <p><strong>Dirección:</strong> {selectedOperador.direccion}</p>
              <p><strong>País:</strong> {selectedOperador.Pais}</p>
              <p><strong>Estado:</strong> {selectedOperador.Estado}</p>
              <p><strong>Delegación:</strong> {selectedOperador.Delegacion}</p>
              <p><strong>Colonia:</strong> {selectedOperador.Colonia}</p>
              <p><strong>Latitud:</strong> {selectedOperador.UbicacionLat}</p>
              <p><strong>Longitud:</strong> {selectedOperador.UbicacionLog}</p>
            </div>
            <div className="col-12">
              <h4>Contacto</h4>
              <p><strong>Teléfono:</strong> {selectedOperador.telefono}</p>
              <p><strong>Lada:</strong> {selectedOperador.Lada}</p>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog 
        header={`${currentOperador ? 'Editar' : 'Nuevo'} Operador`} 
        visible={open} 
        onHide={handleClose} 
        footer={dialogFooter} 
        modal 
        className="p-fluid"
        style={{ width: '450px' }}
      >
        <div className="flex flex-column gap-2 pt-2">
          <div className="field">
            <label htmlFor="nombre" className="font-bold">Nombre</label>
            <InputText
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              autoFocus
              className={formData.nombre ? '' : 'p-invalid'}
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="field">
            <label htmlFor="email" className="font-bold">Email</label>
            <InputText
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className={formData.email ? '' : 'p-invalid'}
              placeholder="Ingrese el email"
            />
          </div>

          <div className="field">
            <label htmlFor="id_tipo_negocio" className="font-bold">Tipo de Negocio</label>
            <Dropdown
              id="id_tipo_negocio"
              value={formData.id_tipo_negocio}
              options={tiposNegocio}
              onChange={(e) => setFormData({ ...formData, id_tipo_negocio: e.value })}
              optionLabel="nombre"
              optionValue="id_tipo_negocio"
              placeholder="Seleccione un tipo de negocio"
              className={formData.id_tipo_negocio ? '' : 'p-invalid'}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="direccion" className="font-bold">Dirección</label>
            <InputText
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
              className={formData.direccion ? '' : 'p-invalid'}
              placeholder="Ingrese la dirección"
            />
          </div>

          <div className="field">
            <label htmlFor="UbicacionLat" className="font-bold">Latitud</label>
            <InputText
              id="UbicacionLat"
              value={formData.UbicacionLat}
              onChange={(e) => {
                const value = e.target.value;
                // Validar que sea un número válido
                if (!value || (value && !isNaN(parseFloat(value)))) {
                  setFormData({ ...formData, UbicacionLat: value });
                }
              }}
              className="w-full"
              placeholder="Ej: 19.4326"
              tooltip="Ingrese la latitud en formato decimal (ej: 19.4326)"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <div className="field">
            <label htmlFor="UbicacionLog" className="font-bold">Longitud</label>
            <InputText
              id="UbicacionLog"
              value={formData.UbicacionLog}
              onChange={(e) => {
                const value = e.target.value;
                // Validar que sea un número válido
                if (!value || (value && !isNaN(parseFloat(value)))) {
                  setFormData({ ...formData, UbicacionLog: value });
                }
              }}
              className="w-full"
              placeholder="Ej: -99.1332"
              tooltip="Ingrese la longitud en formato decimal (ej: -99.1332)"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          <div className="field">
            <label htmlFor="RFC" className="font-bold">RFC</label>
            <InputText
              id="RFC"
              value={formData.RFC}
              onChange={(e) => setFormData({ ...formData, RFC: e.target.value })}
              required
              className={formData.RFC ? '' : 'p-invalid'}
              placeholder="Ingrese el RFC"
            />
          </div>

          <div className="field">
            <label htmlFor="Pais" className="font-bold">País</label>
            <InputText
              id="Pais"
              value={formData.Pais}
              onChange={(e) => setFormData({ ...formData, Pais: e.target.value })}
              required
              className={formData.Pais ? '' : 'p-invalid'}
              placeholder="Ingrese el país"
            />
          </div>

          <div className="field">
            <label htmlFor="Estado" className="font-bold">Estado</label>
            <InputText
              id="Estado"
              value={formData.Estado}
              onChange={(e) => setFormData({ ...formData, Estado: e.target.value })}
              required
              className={formData.Estado ? '' : 'p-invalid'}
              placeholder="Ingrese el estado"
            />
          </div>

          <div className="field">
            <label htmlFor="Delegacion" className="font-bold">Delegación</label>
            <InputText
              id="Delegacion"
              value={formData.Delegacion}
              onChange={(e) => setFormData({ ...formData, Delegacion: e.target.value })}
              required
              className={formData.Delegacion ? '' : 'p-invalid'}
              placeholder="Ingrese la delegación"
            />
          </div>

          <div className="field">
            <label htmlFor="Colonia" className="font-bold">Colonia</label>
            <InputText
              id="Colonia"
              value={formData.Colonia}
              onChange={(e) => setFormData({ ...formData, Colonia: e.target.value })}
              required
              className={formData.Colonia ? '' : 'p-invalid'}
              placeholder="Ingrese la colonia"
            />
          </div>

          <div className="field">
            <label htmlFor="Lada" className="font-bold">Lada</label>
            <InputText
              id="Lada"
              value={formData.Lada}
              onChange={(e) => setFormData({ ...formData, Lada: e.target.value })}
              required
              className={formData.Lada ? '' : 'p-invalid'}
              placeholder="Ingrese la lada"
            />
          </div>

          <div className="field">
            <label htmlFor="tipos_servicio">Tipos de Servicio</label>
            <MultiSelect
              id="tipos_servicio"
              value={formData.tipos_servicio}
              options={tiposServicio}
              onChange={(e) => setFormData({ ...formData, tipos_servicio: e.value })}
              optionLabel="nombre"
              optionValue="id_tipo_servicio"
              placeholder="Seleccione los tipos de servicio"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="tipos_poliza">Tipos de Póliza</label>
            <MultiSelect
              id="tipos_poliza"
              value={formData.tipos_poliza}
              options={tiposPoliza}
              onChange={(e) => setFormData({ ...formData, tipos_poliza: e.value })}
              optionLabel="nombre"
              optionValue="id_tipo_poliza"
              placeholder="Seleccione los tipos de póliza"
              required
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
} 