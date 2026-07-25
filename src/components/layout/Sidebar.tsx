// src/components/layout/Sidebar.tsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, BarChart3, BookOpen, Settings } from 'lucide-react';
import { SettingsModal } from '../modals/SettingsModal';

export const Sidebar: React.FC = () => {
  // Estado para controlar el modal de configuraci n
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <aside className="w-16 md:w-20 h-full border-r border-[#262626] bg-[#0a0a0a] flex flex-col items-center py-6 shrink-0 z-20">
        
        {/* Contenedor de Navegaci n Principal */}
        <div className="flex flex-col gap-6 flex-1 w-full items-center">
          <NavItem to="/journal" icon={<CalendarDays size={22} strokeWidth={1.5} />} title="Journal" />
          <NavItem to="/metrics" icon={<BarChart3 size={22} strokeWidth={1.5} />} title="Metrics" />
          <NavItem to="/playbook" icon={<BookOpen size={22} strokeWidth={1.5} />} title="Playbook" />
        </div>

        {/* Controles Inferiores */}
        <div className="mt-auto w-full flex justify-center">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-xl text-[#737373] hover:text-[#d4d4d4] hover:bg-[#141414] transition-all duration-200" 
            title="Settings / Backup"
          >
            <Settings size={22} strokeWidth={1.5} />
          </button>
        </div>
      </aside>
    </>
  );
};

// Sub-componente para gestionar el estado Activo/Inactivo de los botones
const NavItem = ({ to, icon, title }: { to: string; icon: React.ReactNode; title: string }) => (
  <NavLink
    to={to}
    title={title}
    className={({ isActive }) =>
      `p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
        isActive
          ? 'text-[#d4d4d4] bg-[#141414] border border-[#262626] shadow-sm'
          : 'text-[#525252] hover:text-[#d4d4d4] hover:bg-[#141414] border border-transparent'
      }`
    }
  >
    {icon}
  </NavLink>
);