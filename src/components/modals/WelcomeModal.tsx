// src/components/modals/WelcomeModal.tsx

import React, { useState, useEffect } from 'react';
import { Moon, Play, FolderOpen, Plus, ShieldCheck } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { getAllStrategies, addStrategy } from '../../data/queries';
import { Strategy } from '../../types';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentStrategyId, addStrategyToStore } = useMoonStore();
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [activeTab, setActiveTab] = useState<'NEW' | 'LOAD'>('NEW');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (NEW)
  const [name, setName] = useState('');
  const [capital, setCapital] = useState('10000');

  // Form State (LOAD)
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');

  // Fetch existing strategies on mount
  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true);
      getAllStrategies().then(data => {
        setStrategies(data);
        if (data.length > 0) {
          setActiveTab('LOAD');
          setSelectedStrategyId(data[0].id);
        }
        setIsLoadingData(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isNaN(Number(capital)) || Number(capital) <= 0) return;

    setIsSubmitting(true);
    try {
      const newStrategy: Strategy = {
        id: crypto.randomUUID(),
        name: name.trim(),
        initialCapital: Number(capital),
        createdAt: Date.now(),
        // Inicializamos los campos Pro vacíos para que los edites en el Playbook
        rules: '',
        marketContext: '',
        riskParameters: '',
        manifesto: ''
      };

      await addStrategy(newStrategy);
      addStrategyToStore(newStrategy);
      setCurrentStrategyId(newStrategy.id);
      
      onClose();
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Error creating session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStrategyId) return;
    
    setCurrentStrategyId(selectedStrategyId);
    onClose();
  };

  return (
    // Backdrop estricto (no se cierra al hacer clic fuera para obligar el Setup)
    <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      
      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Cabecera del Modal */}
        <div className="p-8 text-center border-b border-[#262626] bg-gradient-to-b from-[#141414] to-[#0f0f0f]">
          <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-[#262626] flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Moon size={32} className="text-[#2563EB]" strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-xl tracking-widest text-[#d4d4d4] uppercase font-bold">Moon Terminal</h2>
          <p className="text-[#737373] text-xs font-mono mt-2 tracking-wider">Institutional Backtesting Engine</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-[#262626] bg-[#0a0a0a]">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'NEW' 
                ? 'text-[#2563EB] border-b-2 border-[#2563EB] bg-[#0f0f0f]' 
                : 'text-[#525252] hover:text-[#d4d4d4] hover:bg-[#141414]'
            }`}
          >
            <Plus size={14} /> New Session
          </button>
          <button
            onClick={() => setActiveTab('LOAD')}
            disabled={strategies.length === 0}
            className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'LOAD' 
                ? 'text-[#2563EB] border-b-2 border-[#2563EB] bg-[#0f0f0f]' 
                : 'text-[#525252] hover:text-[#d4d4d4] hover:bg-[#141414]'
            } ${strategies.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <FolderOpen size={14} /> Load Profile
          </button>
        </div>

        <div className="p-8">
          {isLoadingData ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* --- FORMULARIO: NUEVA SESIÓN --- */}
              {activeTab === 'NEW' && (
                <form onSubmit={handleCreateSession} className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Strategy Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., NQ London Breakout"
                      className="w-full bg-[#141414] border border-[#262626] rounded-md px-4 py-3 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Simulation Capital (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252] font-mono text-sm">$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={capital}
                        onChange={(e) => setCapital(e.target.value)}
                        className="w-full bg-[#141414] border border-[#262626] rounded-md pl-8 pr-4 py-3 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#262626]">
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white px-4 py-3 rounded hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm tracking-wide font-bold"
                    >
                      <Play size={16} fill="currentColor" />
                      INITIALIZE SESSION
                    </button>
                    <p className="text-center text-[10px] text-[#525252] font-mono mt-4 flex items-center justify-center gap-1">
                      <ShieldCheck size={12} /> Local offline storage
                    </p>
                  </div>
                </form>
              )}

              {/* --- FORMULARIO: CARGAR SESIÓN --- */}
              {activeTab === 'LOAD' && (
                <form onSubmit={handleLoadSession} className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Select Profile</label>
                    <select
                      value={selectedStrategyId}
                      onChange={(e) => setSelectedStrategyId(e.target.value)}
                      className="w-full bg-[#141414] border border-[#262626] rounded-md px-4 py-3 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors font-mono appearance-none cursor-pointer"
                      required
                    >
                      {strategies.map((strat) => (
                        <option key={strat.id} value={strat.id}>
                          {strat.name} - ${strat.initialCapital.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-[#262626]">
                    <button
                      type="submit"
                      disabled={!selectedStrategyId}
                      className="w-full flex items-center justify-center gap-2 bg-[#141414] border border-[#262626] text-[#d4d4d4] hover:text-white px-4 py-3 rounded hover:bg-[#1a1a1a] hover:border-[#525252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm tracking-wide font-bold"
                    >
                      <FolderOpen size={16} />
                      LOAD SESSION
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};