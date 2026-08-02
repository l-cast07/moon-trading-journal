// src/components/modals/StrategyModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { addStrategy, updateStrategy, getStrategyById } from '../../data/queries';
import { Strategy } from '../../types';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyIdToEdit?: string | null; // Nulo = Crear nueva, String = Editar existente
}

export const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose, strategyIdToEdit }) => {
  const { addStrategyToStore, updateStrategyInStore, setCurrentStrategyId } = useMoonStore();
  
  const [name, setName] = useState('');
  const [capital, setCapital] = useState('10000');
  const [rules, setRules] = useState('');
  const [marketContext, setMarketContext] = useState('');
  const [riskParameters, setRiskParameters] = useState('');
  const [manifesto, setManifesto] = useState('');
  
  const [allowedConfirmations, setAllowedConfirmations] = useState<string[]>([]);
  const [confInput, setConfInput] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efecto para popular el formulario si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (strategyIdToEdit) {
        getStrategyById(strategyIdToEdit).then(strat => {
          if (strat) {
            setName(strat.name);
            setCapital(strat.initialCapital.toString());
            setRules(strat.rules || '');
            setMarketContext(strat.marketContext || '');
            setRiskParameters(strat.riskParameters || '');
            setManifesto(strat.manifesto || '');
            setAllowedConfirmations(strat.allowedConfirmations || []);
          }
        });
      } else {
        // Limpiar para crear una nueva
        setName('');
        setCapital('10000');
        setRules('');
        setMarketContext('');
        setRiskParameters('');
        setManifesto('');
        setAllowedConfirmations([]);
      }
    }
  }, [isOpen, strategyIdToEdit]);

  if (!isOpen) return null;

  const handleAddConf = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      const val = confInput.trim().toUpperCase();
      if (val && !allowedConfirmations.includes(val)) {
        setAllowedConfirmations([...allowedConfirmations, val]);
      }
      setConfInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isNaN(Number(capital)) || Number(capital) <= 0) {
      alert("Please provide a valid name and initial capital.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (strategyIdToEdit) {
        // Modo Edición
        const updates: Partial<Strategy> = {
          name: name.trim(),
          initialCapital: Number(capital),
          rules: rules.trim(),
          marketContext: marketContext.trim(),
          riskParameters: riskParameters.trim(),
          manifesto: manifesto.trim(),
          allowedConfirmations,
        };
        await updateStrategy(strategyIdToEdit, updates);
        updateStrategyInStore(strategyIdToEdit, updates);
      } else {
        // Modo Creación
        const newStrategy: Strategy = {
          id: crypto.randomUUID(),
          name: name.trim(),
          initialCapital: Number(capital),
          createdAt: Date.now(),
          rules: rules.trim(),
          marketContext: marketContext.trim(),
          riskParameters: riskParameters.trim(),
          manifesto: manifesto.trim(),
          allowedConfirmations,
        };
        await addStrategy(newStrategy);
        addStrategyToStore(newStrategy);
        setCurrentStrategyId(newStrategy.id); // Auto-activar si es nueva
      }
      onClose();
    } catch (error) {
      console.error("Failed to save strategy:", error);
      alert("Error saving strategy profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="h-14 px-6 border-b border-[#262626] flex justify-between items-center bg-[#0a0a0a]">
          <h2 className="font-mono text-sm tracking-wider text-[#d4d4d4] uppercase">
            {strategyIdToEdit ? 'Edit Strategy Profile' : 'New Strategy Profile'}
          </h2>
          <button onClick={onClose} className="text-[#525252] hover:text-[#d4d4d4] transition-colors p-1 rounded hover:bg-[#141414]">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Strategy Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., NQ Scalping"
                  className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                  autoFocus required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Initial Capital ($)</label>
                <input
                  type="number" min="1" step="0.01" value={capital} onChange={(e) => setCapital(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <hr className="border-[#262626]" />

            {/* Dynamic Confirmations Builder */}
            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Base Confirmations (Press Enter)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text" value={confInput} onChange={(e) => setConfInput(e.target.value)} onKeyDown={handleAddConf}
                  placeholder="e.g., FVG+, OB, LIQ SWEEP..."
                  className="flex-1 bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors font-mono uppercase"
                />
                <button type="button" onClick={handleAddConf} className="bg-[#262626] hover:bg-[#404040] text-[#d4d4d4] px-4 rounded flex items-center justify-center transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allowedConfirmations.map(conf => (
                  <span key={conf} className="bg-[#2563EB]/20 border border-[#2563EB]/30 text-[#2563EB] text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                    {conf} 
                    <X size={10} className="cursor-pointer hover:text-white transition-colors" onClick={() => setAllowedConfirmations(allowedConfirmations.filter(c => c !== conf))} />
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-[#262626]" />

            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Philosophy & Manifesto</label>
              <textarea value={manifesto} onChange={(e) => setManifesto(e.target.value)} rows={2} className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors resize-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Golden Rules</label>
              <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={3} className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors resize-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Market Context</label>
              <textarea value={marketContext} onChange={(e) => setMarketContext(e.target.value)} rows={2} className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors resize-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#737373] uppercase tracking-wider mb-2">Risk Parameters</label>
              <textarea value={riskParameters} onChange={(e) => setRiskParameters(e.target.value)} rows={2} className="w-full bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-[#d4d4d4] text-sm focus:outline-none focus:border-[#2563EB] transition-colors resize-none font-mono" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-mono text-[#737373] hover:text-[#d4d4d4] transition-colors" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !name.trim()} className="flex items-center gap-2 bg-[#d4d4d4] text-[#0a0a0a] px-5 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Save size={16} strokeWidth={2.5} />
              <span className="text-sm font-mono tracking-wide">{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};