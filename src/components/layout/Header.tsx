// src/components/layout/Header.tsx
import React from 'react';
import { Moon, DatabaseBackup } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { exportData } from '../../utils/backup';

export const Header: React.FC = () => {
  const { currentStrategyId, setCurrentStrategyId, strategies } = useMoonStore();

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

      {/* Centro: Selector Dinámico de Estrategia */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3">
        <span className="text-xs text-[#525252] uppercase tracking-wider font-mono">Active Profile</span>
        <select
          value={currentStrategyId || ''}
          onChange={(e) => setCurrentStrategyId(e.target.value)}
          className="bg-[#141414] border border-[#262626] rounded px-4 py-1.5 text-sm text-[#d4d4d4] hover:border-[#404040] focus:outline-none focus:border-[#2563EB] transition-colors font-mono cursor-pointer appearance-none min-w-56"
        >
          <option value="" disabled>Select a Strategy...</option>
          {strategies.map((strat) => (
            <option key={strat.id} value={strat.id}>
              {strat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Derecha: Estado de Sincronización y Acciones Rápidas */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0f0f0f] border border-[#262626]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-xs text-[#737373] font-mono">Synced</span>
        </div>
        
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