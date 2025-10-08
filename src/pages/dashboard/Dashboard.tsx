import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">      

      <div className="dashboard-content">
        <div className="hero-section">
          <div className="hero-overlay">
            <div className="hero-text">
              <h1>Buscador de asesores</h1>
              <Button 
                label="LOCALIZADOR" 
                className="p-button-lg localizador-button"
                onClick={() => navigate('/localizador')}
              />
            </div>
          </div>
        </div>

        <div className="dashboard-cards">

          <Card title="Catálogos" className="dashboard-card col-4">
            <p>Accede a todos los catálogos de servicios disponibles.</p>
            <Button 
              label="Ver Catálogos" 
              icon="pi pi-list" 
              className="p-button-outlined" 
              onClick={() => navigate('/Operadores')}
            />
          </Card>

          { false && <Card title="Mis Solicitudes" className="dashboard-card">
              <p>Consulta el estado de tus solicitudes actuales.</p>
              <Button 
                label="Ver Solicitudes" 
                icon="pi pi-file" 
                className="p-button-outlined" 
                onClick={() => navigate('/solicitudes')}
              />
            </Card>
          }
          
          { false && <Card title="Perfil" className="dashboard-card">
            <p>Actualiza tus datos personales y preferencias.</p>
            <Button 
              label="Editar Perfil" 
              icon="pi pi-user-edit" 
              className="p-button-outlined" 
              onClick={() => navigate('/perfil')}
            />
          </Card>
          }
          

        </div>
      </div>
    </div>
  );
};

export default Dashboard; 