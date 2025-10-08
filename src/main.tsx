import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { PrimeReactProvider } from 'primereact/api'

// Importar estilos de PrimeReact y PrimeFlex
import "primereact/resources/themes/lara-light-blue/theme.css"

import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import 'primeflex/primeflex.css'
import './index.css'
import React from 'react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
) 