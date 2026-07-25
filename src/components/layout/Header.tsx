// src/components/layout/Header.tsx

import React from 'react';
import { Moon, DatabaseBackup } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { exportData } from '../../utils/backup';

export const Header: React.FC = () => {
  const { currentStrategyId } = useMoonStore();

  const handleQuickExport = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error(error);
      alert('Failed to export backup. Please check console for details.');
    }
  };

  return (
    <header className="h-16 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 z-10">
      
      {/* Izquierda: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#141414] border border-[#262626] flex items-center justify-center">
          <Moon size={16} className="text-[#d4d4d4]" strokeWidth={2} />
        </div>
        <span className="font-mono font-bold tracking-widest text-[#d4d4d4] text-sm uppercase">MOON</span>
      </div>

      {/* Centro: Selector de Estrategia (Ancla de Contexto) */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3">
        <span className="text-xs text-[#525252] uppercase tracking-wider font-mono">Strategy</span>
        <button className="text-sm px-4 py-1.5 bg-[#141414] border border-[#262626] rounded text-[#d4d4d4] hover:border-[#404040] hover:bg-[#1a1a1a] transition-colors focus:outline-none focus:ring-1 focus:ring-[#525252]">
          {currentStrategyId ? 'Active Strategy' : 'Select Strategy'}
        </button>
      </div>

      {/* Derecha: Estado de Sincronizaci n y Acciones R pidas */}
      <div className="flex items-center gap-4">
        
        {/* Indicador de Auto-Save */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0f0f0f] border border-[#262626]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-xs text-[#737373] font-mono">Synced</span>
        </div>
        
        {/* Bot n R pido de Exportaci n (Conectado) */}
        <button 
          onClick={handleQuickExport}
          className="text-[#525252] hover:text-[#d4d4d4] transition-colors"
          title="Quick Export Backup"
        >
          <DatabaseBackup size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};