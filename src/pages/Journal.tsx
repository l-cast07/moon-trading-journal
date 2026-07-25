// src/pages/Journal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { useMoonStore } from '../store/useMoonStore';
import { TradeForm } from '../components/forms/TradeForm';
import { Calendar } from '../components/calendar/Calendar';
import { StatusBar } from '../components/layout/StatusBar';

export const Journal: React.FC = () => {
  // Conectamos el estado global
  const { isSidePanelOpen, setSidePanelOpen } = useMoonStore();

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      
      {/* Área Principal: Contenedor del Dashboard y Calendario */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidePanelOpen ? 'mr-0 lg:mr-[450px]' : 'mr-0'
        }`}
      >
        
        {/* =========================================
            BARRA DE ESTADO: CENTRO DE MANDO PRO
            ========================================= */}
        <StatusBar />

        {/* Contenedor del Calendario */}
        <div className="flex-1 min-h-0 bg-[#0a0a0a] rounded-lg">
          <Calendar />
        </div>
      </div>

      {/* =========================================
          PANEL LATERAL: REGISTRO DE ALTA VELOCIDAD
          ========================================= */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0a0a0a] border-l border-[#262626] shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${
          isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del Panel Lateral */}
        <div className="h-16 px-6 border-b border-[#262626] flex justify-between items-center bg-[#0a0a0a] shrink-0">
          <h2 className="font-mono text-sm tracking-wider text-[#d4d4d4] uppercase">High-Speed Trade Entry</h2>
          <button 
            onClick={() => setSidePanelOpen(false)}
            className="text-[#525252] hover:text-[#d4d4d4] transition-colors p-1.5 rounded hover:bg-[#141414]"
            title="Close Panel"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Área de Contenido del Panel Lateral */}
        <div className="flex-1 overflow-hidden bg-[#0f0f0f]">
          <TradeForm />
        </div>
      </div>
      
    </div>
  );
};