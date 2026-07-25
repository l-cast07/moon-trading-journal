// src/App.tsx

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WelcomeModal } from './components/modals/WelcomeModal';

// Pages
import { Journal } from './pages/Journal';
import { Metrics } from './pages/Metrics';
import { Playbook } from './pages/Playbook';

// Store
import { useMoonStore } from './store/useMoonStore';

export const App: React.FC = () => {
  // Leemos si hay una estrategia activa desde Zustand[cite: 15]
  const { currentStrategyId } = useMoonStore();

  return (
    <Router>
      {/* 
        Módulo de Configuración (Setup Inicial):
        Se muestra obligatoriamente superpuesto a toda la app si no hay un perfil cargado. 
        Al crear o cargar una estrategia, currentStrategyId se actualiza y este modal desaparece automáticamente.
      */}
      <WelcomeModal 
        isOpen={!currentStrategyId} 
        onClose={() => {}} // Se maneja automáticamente por el cambio de estado global
      />

      {/* Contenedor principal: Dark Theme puro (Fondo casi negro, texto gris humo)[cite: 15] */}
      <div className="flex h-screen w-full bg-[#0a0a0a] text-[#d4d4d4] font-sans overflow-hidden">
        
        {/* Navegación Lateral Fija[cite: 15] */}
        <Sidebar />

        {/* Área Central de Trabajo[cite: 15] */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          
          {/* Cabecera de Contexto (Siempre visible)[cite: 15] */}
          <Header />

          {/* Contenedor de las Vistas (Aquí se inyectan las páginas)[cite: 15] */}
          <main className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
            <Routes>
              {/* Ruta base por defecto[cite: 15] */}
              <Route path="/" element={<Navigate to="/journal" replace />} />
              
              <Route path="/journal" element={<Journal />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/playbook" element={<Playbook />} />

              {/* Ruta de seguridad para URLs no encontradas[cite: 15] */}
              <Route path="*" element={<Navigate to="/journal" replace />} />
            </Routes>
          </main>
          
        </div>
      </div>
    </Router>
  );
};

export default App;