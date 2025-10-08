import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import axios from 'axios';
import { Socio, Poliza, getSocioById, TipoPoliza, getTiposPoliza, updateSocioPhoto } from '../../services/socioService';

const SocioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [socio, setSocio] = useState<Socio | null>(null);
  const [tiposPoliza, setTiposPoliza] = useState<TipoPoliza[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (id) {
      loadSocio(parseInt(id));
    }
  }, [id]);

  const loadSocio = async (socioId: number) => {
    try {
      setLoading(true);
      const data = await getSocioById(socioId);
      setSocio(data);
      const tiposPolizaData = await getTiposPoliza();
      setTiposPoliza(tiposPolizaData);
    } catch (error) {
      console.error('Error al cargar datos del socio:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la información del socio',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('No se pudo convertir el archivo a base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Subir foto usando FormData (para el endpoint foto-upload)
  const handleFileUpload = async (event: any) => {
    if (!id) return;
    
    try {
      setUploading(true);
      
      const file = event.files[0];
      
      // Uso FormData para subir el archivo
      const formData = new FormData();
      formData.append('foto', file);
      
      const response = await axios.post(`${API_URL}/socios/${id}/foto-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Recargar los datos del socio para mostrar la nueva foto
      if (response.status === 200) {
        await loadSocio(parseInt(id));
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto actualizada correctamente',
          life: 3000
        });
      }
      
      // Limpiar el componente de carga
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo subir la foto',
        life: 3000
      });
    } finally {
      setUploading(false);
    }
  };

  // Subir foto con conversión a base64 (para el endpoint foto)
  const handleFileUploadBase64 = async (event: any) => {
    if (!id) return;
    
    try {
      setUploading(true);
      
      const file = event.files[0];
      
      // Convertir archivo a base64
      const base64String = await fileToBase64(file);
      
      // Subir la imagen usando el servicio
      await updateSocioPhoto(parseInt(id), base64String);
      
      // Recargar los datos del socio
      await loadSocio(parseInt(id));
      
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Foto actualizada correctamente',
        life: 3000
      });
      
      // Limpiar el componente de carga
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo subir la foto',
        life: 3000
      });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
  };

  const estadoTemplate = (poliza: Poliza) => {
    const getSeverity = (estado: string) => {
      switch (estado) {
        case 'Activa':
          return 'success';
        case 'Inactiva':
          return 'warning';
        case 'Vencida':
          return 'danger';
        case 'Cancelada':
          return 'info';
        default:
          return null;
      }
    };

    return <Tag value={poliza.estado} severity={getSeverity(poliza.estado)} />;
  };

  const montoTemplate = (poliza: Poliza) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'MXN' }).format(Number(poliza.monto));
  };

  const tipoPolizaTemplate = (poliza: Poliza) => {
    const tipoPoliza = tiposPoliza.find(tp => tp.id_tipo_poliza === poliza.id_tipo_poliza);
    return tipoPoliza?.nombre || '?';
  };

  const handleEdit = () => {
    if (socio?.id_socio) {
      navigate(`/socios/edit/${socio.id_socio}`);
    }
  };

  const handleBack = () => {
    navigate('/socios');
  };

  if (loading) {
    return <div className="card">Cargando información del socio...</div>;
  }

  if (!socio) {
    return <div className="card">No se encontró información del socio</div>;
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Detalles del Socio</h2>
        <div className="flex gap-2">
          <Button icon="pi pi-arrow-left" label="Ir a Socios" outlined onClick={handleBack} />
          {/* <Button icon="pi pi-pencil" label="Editar" onClick={handleEdit} /> */}
        </div>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6">
          <Card title="Información Personal" className="h-full">
            <div className="p-fluid">
              <div className="field mb-4 flex flex-column align-items-center">
                {socio.foto ? (
                  <Image 
                    src={socio.foto} 
                    alt={`${socio.nombre} ${socio.apellido}`} 
                    width="150" 
                    preview 
                    className="mb-2 border-round shadow-2"
                    imageClassName="border-round"
                    pt={{ 
                      image: { style: { objectFit: 'cover', width: '150px', height: '150px' } }
                    }}
                  />
                ) : (
                  <Avatar 
                    icon="pi pi-user" 
                    size="xlarge" 
                    shape="circle" 
                    className="mb-2"
                    style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                  />
                )}
                <div className="text-xl font-bold text-center mt-2">{`${socio.nombre} ${socio.apellido}`}</div>
                
                <div className="mt-3 w-full">
                  <FileUpload
                    ref={fileUploadRef}
                    name="foto"
                    accept="image/*"
                    maxFileSize={1000000}
                    emptyTemplate={<p className="m-0">Arrastra y suelta una imagen aquí</p>}
                    auto
                    chooseLabel="Cambiar foto"
                    uploadLabel="Subir"
                    cancelLabel="Cancelar"
                    className="w-full"
                    customUpload
                    uploadHandler={handleFileUploadBase64}
                    disabled={uploading}
                    mode="basic"
                    pt={{
                      chooseButton: { className: 'w-full p-button-outlined p-button-sm' }
                    }}
                  />
                  {uploading && (
                    <div className="mt-2 text-center">
                      <i className="pi pi-spin pi-spinner mr-2"></i>
                      <span>Subiendo foto...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="field">
                <label className="font-bold">Email</label>
                <div>{socio.email}</div>
              </div>
              <div className="field">
                <label className="font-bold">Teléfono</label>
                <div>{socio.telefono || 'No especificado'}</div>
              </div>
              <div className="field">
                <label className="font-bold">Dirección</label>
                <div>{socio.direccion || 'No especificada'}</div>
              </div>
              <div className="field">
                <label className="font-bold">Fecha de Registro</label>
                <div>{socio.fecha_registro ? formatDate(socio.fecha_registro) : 'No disponible'}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card title="Resumen de Pólizas" className="h-full">
            <div className="flex flex-column align-items-center justify-content-center h-full">
              <div className="text-5xl font-bold mb-3">{socio.polizas?.length || 0}</div>
              <div className="text-xl">Pólizas Registradas</div>
              {socio.polizas && socio.polizas.length > 0 && (
                <div className="mt-3">
                  <div className="text-lg font-medium">Valor Total:</div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'MXN' }).format(
                      socio.polizas.reduce((sum, poliza) => sum + Number(poliza.monto), 0)
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Divider />

      <Card title="Pólizas del Socio" className="mt-3">
        {socio.polizas && socio.polizas.length > 0 ? (
          <DataTable 
            value={socio.polizas} 
            paginator 
            rows={5} 
            rowsPerPageOptions={[5, 10, 25]} 
            responsiveLayout="scroll"
          >
            <Column field="numero_poliza" header="Número de Póliza" sortable />
            <Column field="tipo_poliza" header="Tipo" body={tipoPolizaTemplate} sortable />
            <Column field="fecha_inicio" header="Fecha Inicio" body={(rowData) => formatDate(rowData.fecha_inicio)} sortable />
            <Column field="fecha_fin" header="Fecha Fin" body={(rowData) => formatDate(rowData.fecha_fin)} sortable />
            <Column field="monto" header="Monto" body={montoTemplate} sortable />
            <Column field="estado" header="Estado" body={estadoTemplate} sortable />
          </DataTable>
        ) : (
          <div className="p-3 text-center">Este socio no tiene pólizas registradas</div>
        )}
      </Card>
    </div>
  );
};

export default SocioDetailPage; 