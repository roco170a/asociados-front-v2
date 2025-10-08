import { useNavigate } from 'react-router-dom'
import { Menubar } from 'primereact/menubar'
import { Button } from 'primereact/button'
import { MenuItem } from 'primereact/menuitem'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth();

  const items: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Localizador',
      icon: 'pi pi-map-marker',
      command: () => navigate('/localizador')
    },
    {
      label: 'Chat',
      icon: 'pi pi-comments',
      command: () => navigate('/chat')
    },
    {
      label: 'Catálogos',
      icon: 'pi pi-book',
      items: [
        {
          label: 'Usuarios',
          icon: 'pi pi-user',
          command: () => navigate('/usuarios')
        },
        {
          label: 'Socios',
          icon: 'pi pi-id-card',
          command: () => navigate('/socios')
        },
        {
          label: 'Operadores',
          icon: 'pi pi-users',
          command: () => navigate('/operadores')
        },
        {
          label: 'Tipos de Servicio',
          icon: 'pi pi-list',
          command: () => navigate('/tipos-servicio')
        },
        {
          label: 'Tipos de Negocio',
          icon: 'pi pi-briefcase',
          command: () => navigate('/tipos-negocio')
        }
      ]
    }
  ]

  const start = (
    <div className="flex align-items-center">
      <i className="pi pi-id-card mr-2" style={{ fontSize: '2rem' }}></i>

      <span className="text-xl font-semibold mr-6"> Aseguradora ACME </span>
    </div>
  )

  const end = (
    <div className="flex align-items-center gap-2">
      <Button
        icon="pi pi-bell"
        rounded
        text
        severity="secondary"
        className="p-button-text-secondary"
        tooltip="Notificaciones"
        tooltipOptions={{ position: 'bottom' }}
      />
      <div className="dashboard-actions">
          <span className="welcome-message">Bienvenido, {user?.name || 'Usuario'}</span>
          <Button 
            icon="pi pi-sign-out" 
            className="p-button-rounded p-button-text" 
            tooltip="Cerrar sesión" tooltipOptions={{ position: 'left' }}
            onClick={logout}
          />
        </div>
    </div>
  )

  return (

    
      <Menubar
        model={items}
        start={start}
        end={end}
        className="px-4 border-noround p-menunar"
      />
    


  )
} 