// src/components/forms/ConfirmationBuilder.tsx
import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { TradeConfirmation } from '../../types';

interface Props {
  availableTypes: string[];
  selectedConfirmations: TradeConfirmation[];
  onChange: (confirmations: TradeConfirmation[]) => void;
}

const COMMON_TIMEFRAMES = ['1m', '3m', '5m', '15m', '1H', '4H', 'D'];

export const ConfirmationBuilder: React.FC<Props> = ({ availableTypes, selectedConfirmations, onChange }) => {
  const [type, setType] = useState(availableTypes[0] || '');
  const [timeframe, setTimeframe] = useState('');
  const tfInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const finalType = type || availableTypes[0];
    if (!finalType || !timeframe.trim()) return;

    onChange([
      ...selectedConfirmations, 
      { id: crypto.randomUUID(), type: finalType, timeframe: timeframe.trim() }
    ]);
    setTimeframe('');
    tfInputRef.current?.focus(); // Mantiene el foco para añadir múltiples rápido
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const removeConf = (id: string) => {
    onChange(selectedConfirmations.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-2">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="flex-1 bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] outline-none"
        >
          {availableTypes.length === 0 && <option value="">No types setup...</option>}
          {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <input 
          ref={tfInputRef}
          type="text" 
          placeholder="TF (e.g. 15m)" 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          onKeyDown={handleKeyDown}
          list="timeframes"
          className="w-24 bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] outline-none uppercase"
        />
        <datalist id="timeframes">
          {COMMON_TIMEFRAMES.map(tf => <option key={tf} value={tf} />)}
        </datalist>

        <button 
          type="button" 
          onClick={handleAdd}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-1.5 rounded flex items-center justify-center transition-colors shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Píldoras de confirmaciones añadidas */}
      <div className="flex flex-wrap gap-2">
        {selectedConfirmations.map((conf) => (
          <div key={conf.id} className="flex items-center bg-[#141414] border border-[#262626] rounded px-2 py-1 text-[10px] font-mono text-[#d4d4d4] shadow-sm">
            <span className="font-bold text-[#2563EB] mr-1">{conf.type}</span>
            <span className="text-[#737373] mr-2">({conf.timeframe})</span>
            <button type="button" onClick={() => removeConf(conf.id)} className="text-[#525252] hover:text-[#f87171] transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};