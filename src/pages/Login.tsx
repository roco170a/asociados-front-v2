import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';

import './Login.css'; // Asegúrate de crear este archivo CSS

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (email && password) {
      await login({ email, password });
    }
  };

  const header = (
    <div className="login-header">
      <img 
        src="/login.png" 
        alt="Logo" 
        className="login-logo" 
      />
      <h2>Iniciar Sesión</h2>
    </div>
  );

  return (
    <div className="login-container">
      <Card 
        title={header}
        className="login-card"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="email">Correo Electrónico</label>
              <InputText 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={submitted && !email ? 'p-invalid' : ''}
              />
              {submitted && !email && <small className="p-error">Email es requerido.</small>}
            </div>
            
            <div className="p-field">
              <label htmlFor="password">Contraseña</label>
              <Password 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                feedback={false}
                toggleMask
                className={submitted && !password ? 'p-invalid' : ''}
              />
              {submitted && !password && <small className="p-error">Contraseña es requerida.</small>}
            </div>
            
            {error && (
              <div className="p-field">
                <Message severity="error" text={error} />
              </div>
            )}
            
            <div className="login-footer">
              <Button 
                label="Iniciar Sesión" 
                icon="pi pi-sign-in" 
                type="submit"
                loading={loading} 
                className="p-button-primary" 
              />
            </div>
          </div>
        </form>
        
        <Divider />
        
        <div className="login-links">
          <a href="#" onClick={() => navigate('/forgot-password')}>¿Olvidaste tu contraseña?</a>
        </div>
      </Card>
    </div>
  );
};

export default Login; 