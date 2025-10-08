import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { confirmDialog } from 'primereact/confirmdialog';
import userService, { Usuario, Socio, UsuarioFormData } from '../../services/userService';
import notificationService from '../../services/notificationService';
import { formatDate } from '../../utils/formatters';
import { InputTextarea } from 'primereact/inputtextarea';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [formData, setFormData] = useState<UsuarioFormData>({
    email: '',
    name: '',
    password: '',
    telefono: '',
    socioId: undefined
  });
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState<Usuario | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const toast = useRef<Toast>(null);

  const dataTableProps = {
    tableStyle: { minWidth: '50rem' },
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    stripedRows: true,
    loading: loading
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsuarios(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar usuarios',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSocios = async () => {
    try {
      const data = await userService.getSocios();
      setSocios(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar socios',
        life: 3000
      });
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchSocios();
  }, []);

  const handleOpen = (usuario?: Usuario) => {
    if (usuario) {
      setCurrentUsuario(usuario);
      setFormData({
        email: usuario.email,
        name: usuario.name || '',
        telefono: usuario.telefono || '',
        // No incluimos password para evitar sobrescribir la contraseña existente
        socioId: usuario.socio && usuario.socio.length > 0 ? usuario.socio[0].id_socio : undefined
      });
    } else {
      setCurrentUsuario(null);
      setFormData({
        email: '',
        name: '',
        password: '',
        telefono: '',
        socioId: undefined
      });
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentUsuario) {
        await userService.updateUser(currentUsuario.id_usuario, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado correctamente',
          life: 3000
        });
      } else {
        await userService.createUser(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente',
          life: 3000
        });
      }
      fetchUsuarios();
      setOpen(false);
      setFormData({
        email: '',
        name: '',
        password: '',
        telefono: '',
        socioId: undefined
      });
      setCurrentUsuario(null);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: currentUsuario 
          ? 'Error al actualizar usuario' 
          : 'Error al crear usuario',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    confirmDialog({
      message: '¿Está seguro de eliminar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        try {
          setLoading(true);
          await userService.deleteUser(id);
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario eliminado correctamente',
            life: 3000
          });
          fetchUsuarios();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar usuario',
            life: 3000
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleOpenNotification = (usuario: Usuario) => {
    setNotificationTarget(usuario);
    setNotificationOpen(true);
    setNotificationTitle('');
    setNotificationMessage('');
  };

  const handleSendNotification = async () => {
    if (!notificationTarget || !notificationMessage) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Se requiere un mensaje para enviar la notificación',
        life: 3000
      });
      return;
    }

    try {
      setLoading(true);
      if (notificationTarget.fcm_value) {
        await notificationService.sendNotification({
          token: notificationTarget.fcm_value,
          titulo: notificationTitle || 'Notificación importante',
          mensaje: notificationMessage
        });

        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Notificación enviada correctamente',
          life: 3000
        });
        setNotificationOpen(false);
      } else {
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'El usuario no tiene un token FCM válido para recibir notificaciones',
          life: 4000
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al enviar la notificación',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const dateBodyTemplate = (rowData: Usuario, field: keyof Usuario) => {
    return formatDate(rowData[field] as Date);
  };

  const socioBodyTemplate = (rowData: Usuario) => {
    if (rowData.socio && rowData.socio.length > 0) {
      const socio = rowData.socio[0];
      return `${socio.nombre} ${socio.apellido}`;
    }
    return 'No asignado';
  };

  const actionBodyTemplate = (rowData: Usuario) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          className="p-button-rounded p-button-success"
          onClick={() => handleOpen(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          className="p-button-rounded p-button-danger"
          severity="danger"
          onClick={() => handleDelete(rowData.id_usuario)}
        />
        <Button
          icon="pi pi-bell"
          rounded
          className="p-button-rounded p-button-info"
          severity="info"
          tooltip="Enviar notificación"
          onClick={() => handleOpenNotification(rowData)}
        />
      </div>
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      
      <div className="flex justify-content-between mb-4">
        <h1 className="text-2xl mb-0">Gestión de Usuarios</h1>
        <Button
          label="Nuevo Usuario"
          icon="pi pi-plus"
          onClick={() => handleOpen()}
        />
      </div>

      <DataTable value={usuarios} {...dataTableProps}>
        <Column field="id_usuario" header="ID" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="name" header="Nombre" sortable />
        <Column field="telefono" header="Teléfono" sortable />
        <Column header="Socio" body={socioBodyTemplate} sortable />
        <Column 
          field="createdAt" 
          header="Fecha Creación" 
          body={(rowData) => dateBodyTemplate(rowData, 'createdAt')} 
          sortable 
        />
        <Column 
          field="updatedAt" 
          header="Última Actualización" 
          body={(rowData) => dateBodyTemplate(rowData, 'updatedAt')} 
          sortable 
        />
        <Column header="Acciones" body={actionBodyTemplate} />
      </DataTable>

      <Dialog
        visible={open}
        onHide={() => setOpen(false)}
        header={currentUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        style={{ width: '450px' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-column gap-3 pt-4">
          <div className="field">
            <label htmlFor="email" className="block font-bold mb-2">
              Email *
            </label>
            <InputText
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="name" className="block font-bold mb-2">
              Nombre
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="block font-bold mb-2">
              {currentUsuario ? 'Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña *'}
            </label>
            <Password
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full"
              feedback={false}
              toggleMask
              required={!currentUsuario}
            />
          </div>

          <div className="field">
            <label htmlFor="telefono" className="block font-bold mb-2">
              Teléfono
            </label>
            <InputText
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="socio" className="block font-bold mb-2">
              Socio
            </label>
            <Dropdown
              id="socio"
              value={formData.socioId}
              options={socios}
              onChange={(e) => setFormData({ ...formData, socioId: e.value })}
              optionLabel="nombre"
              itemTemplate={(option: Socio) => `${option.nombre} ${option.apellido}`}
              optionValue="id_socio"
              placeholder="Seleccione un socio"
              className="w-full"
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setOpen(false)}
              type="button"
              text
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              type="submit"
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        visible={notificationOpen}
        onHide={() => setNotificationOpen(false)}
        header="Enviar Notificación"
        style={{ width: '450px' }}
      >
        <div className="flex flex-column gap-3 pt-4">
          {notificationTarget && (
            <div className="mb-3">
              <p className="mb-1 font-bold">Destinatario:</p>
              <p className="m-0">{notificationTarget.email} {notificationTarget.name ? `(${notificationTarget.name})` : ''}</p>
            </div>
          )}
          
          <div className="field">
            <label htmlFor="titulo" className="block font-bold mb-2">
              Título de la notificación
            </label>
            <InputText
              id="titulo"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="Título (opcional)"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="mensaje" className="block font-bold mb-2">
              Mensaje *
            </label>
            <InputTextarea
              id="mensaje"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={4}
              className="w-full"
              required
              placeholder="Escriba el mensaje de la notificación"
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setNotificationOpen(false)}
              type="button"
              text
            />
            <Button
              label="Enviar"
              icon="pi pi-send"
              onClick={handleSendNotification}
              type="button"
              disabled={!notificationMessage}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
} 