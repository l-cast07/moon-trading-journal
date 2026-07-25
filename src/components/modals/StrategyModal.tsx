// src/components/modals/StrategyModal.tsx

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { addStrategy } from '../../data/queries';
import { Strategy } from '../../types';

const generateId = () => crypto.randomUUID();

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose }) => {
  const { addStrategyToStore, setCurrentStrategyId } = useMoonStore();
  
  // Estados locales para el formulario
  const [name, setName] = useState('');
  const [capital, setCapital] = useState('10000');
  
  // Nuevos estados para el Playbook
  const [rules, setRules] = useState('');
  const [marketContext, setMarketContext] = useState('');
  const [riskParameters, setRiskParameters] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || isNaN(Number(capital)) || Number(capital) <= 0) {
      alert("Please provide a valid name and initial capital.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Construir el objeto Strategy con las nuevas propiedades[cite: 9, 10]
      const newStrategy: Strategy = {
        id: generateId(),
        name: name.trim(),
        initialCapital: Number(capital),
        createdAt: Date.now(),
        rules: rules.trim(),
        marketContext: marketContext.trim(),
        riskParameters: riskParameters.trim(),
      };

      // 2. Guardar en Dexie[cite: 10]
      await addStrategy(newStrategy);

      // 3. Actualizar Zustand[cite: 10]
      addStrategyToStore(newStrategy);
      setCurrentStrategyId(newStrategy.id);

      // 4. Limpiar y cerrar[cite: 10]
      setName('');
      setCapital('10000');
      setRules('');
      setMarketContext('');
      setRiskParameters('');
      onClose();
      
    } catch (error) {
      console.error("Failed to save strategy:", error);
      alert("There was an error saving your strategy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="h-14 px-6 border-b border-[#262626] flex justify-between items-center bg-[#0a0a0a]">
          <h2 className="font-mono text-sm tracking-wider text-[#d4d4d4] uppercase">New Strategy Profile</h2>
          <button onClick={onClose} className="text-[#525252] hover:text-[#d4d4d4] transition-colors p-1 rounded hover:bg-[#141414]">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Agregado max-h y overflow-y-auto para manejar los campos extras sin romper la vista */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            
            {/* Básicos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="strategyName" className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Strategy Name</label>
                <input
                  id="strategyName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., NQ Scalping"
                  className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#525252] transition-colors"
                  autoFocus required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="initialCapital" className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Initial Capital ($)</label>
                <input
                  id="initialCapital"
                  type="number" min="1" step="0.01"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#525252] transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <hr className="border-[#262626]" />

            {/* Playbook Rules */}
            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Trading Rules & Edge</label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="- Execute only after 9:30 AM NY&#10;- Only trade with HTF trend alignment&#10;- Minimum 1:2 R:R..."
                className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#525252] transition-colors resize-none font-mono"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Market Context Configurations</label>
              <textarea
                value={marketContext}
                onChange={(e) => setMarketContext(e.target.value)}
                placeholder="Avoid trading during FOMC days, high impact CPI data, or tight ranges."
                className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#525252] transition-colors resize-none font-mono"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Risk Parameters</label>
              <textarea
                value={riskParameters}
                onChange={(e) => setRiskParameters(e.target.value)}
                placeholder="- Max 1% risk per trade&#10;- Daily loss limit: -2.5%&#10;- Stop trading after 3 consecutive losses."
                className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#525252] transition-colors resize-none font-mono"
                rows={3}
              />
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#737373] hover:text-[#d4d4d4] transition-colors" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !name.trim()} className="flex items-center gap-2 bg-[#d4d4d4] text-[#0a0a0a] px-4 py-2 rounded font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Save size={16} strokeWidth={2} />
              <span className="text-sm">{isSubmitting ? 'Saving...' : 'Create Strategy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};