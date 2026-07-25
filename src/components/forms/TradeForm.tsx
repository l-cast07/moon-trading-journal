// src/components/forms/TradeForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Save, AlertTriangle, Info, Star, ExternalLink, Keyboard, CheckSquare } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { addTrade, getStrategyById } from '../../data/queries';
import { Trade, TradingSession, MarketTrend, TradeDirection, TradeOutcome, ExecutionError, Strategy } from '../../types';
import { useTradeHotkeys } from './HotkeyManager';

const DRAFT_KEY = 'moon_trade_draft';

export const TradeForm: React.FC = () => {
  const { currentStrategyId, setSidePanelOpen } = useMoonStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  // Cargar estrategia activa
  useEffect(() => {
    if (currentStrategyId) {
      getStrategyById(currentStrategyId).then(data => {
        if (data) setStrategy(data);
      });
    }
  }, [currentStrategyId]);

  // Extraer las reglas de la estrategia para generar el Checklist dinámico
  const strategyRules = useMemo(() => {
    if (!strategy?.rules) return [];
    return strategy.rules
      .split('\n')
      .map(r => r.replace(/^[-*]\s*/, '').trim())
      .filter(r => r.length > 0);
  }, [strategy]);

  // Estado del formulario con inicialización desde Autosave (localStorage)
  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try { return JSON.parse(savedDraft); } catch (e) { console.error("Error parsing draft"); }
    }
    return {
      market: 'Nasdaq-100', 
      session: 'NY_AM' as TradingSession,
      trend: 'Bullish' as MarketTrend,
      direction: 'Long' as TradeDirection,
      entryTime: '',
      confirmations: [] as string[],
      riskPercentage: 1.0,
      plannedRR: 2.0,
      achievedRR: 0,
      maxDrawdown: 0,
      outcome: 'NT' as TradeOutcome,
      pnlUSD: 0,
      analysisUrl: '',
      entryUrl: '',
      resultUrl: '',
      executionQuality: 3,
      primaryError: 'None' as ExecutionError,
      tradeNotes: ''
    };
  });

  // Efecto de Autosave
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  // Activa el sistema de Hotkeys en segundo plano
  useTradeHotkeys({ setFormData });

  // Extraer el riesgo máximo permitido del Playbook
  const maxRiskAllowed = useMemo(() => {
    if (!strategy?.riskParameters) return Infinity;
    const match = strategy.riskParameters.match(/(\d+(?:\.\d+)?)\s*%/);
    return match ? parseFloat(match[1]) : 2.0; 
  }, [strategy]);

  const isRiskWarning = Number(formData.riskPercentage) > maxRiskAllowed;

  // Manejadores de cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // AQUÍ ESTABA EL ERROR: Faltaba la declaración de esta función
  const toggleConfirmation = (rule: string) => {
    setFormData((prev: any) => ({
      ...prev,
      confirmations: prev.confirmations.includes(rule)
        ? prev.confirmations.filter((c: string) => c !== rule)
        : [...prev.confirmations, rule]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStrategyId) {
      alert("Please select an active strategy first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateString = new Date().toISOString().split('T')[0];

      const newTrade: Trade = {
        id: crypto.randomUUID(),
        strategyId: currentStrategyId,
        date: dateString,
        timestamp: Date.now(),
        preTrade: {
          market: formData.market,
          session: formData.session,
          trend: formData.trend,
          direction: formData.direction,
          entryTime: formData.entryTime,
          confirmations: formData.confirmations,
        },
        management: {
          riskPercentage: Number(formData.riskPercentage),
          plannedRR: Number(formData.plannedRR),
          achievedRR: Number(formData.achievedRR),
          maxDrawdown: Number(formData.maxDrawdown),
          outcome: formData.outcome,
          pnlUSD: Number(formData.pnlUSD),
        },
        visuals: {
          analysisUrl: formData.analysisUrl,
          entryUrl: formData.entryUrl,
          resultUrl: formData.resultUrl,
        },
        evaluation: {
          executionQuality: Number(formData.executionQuality),
          primaryError: formData.primaryError,
          tradeNotes: formData.tradeNotes,
        },
        isFavorite: false 
      };

      await addTrade(newTrade);
      
      // Limpiar autosave y resetear form
      localStorage.removeItem(DRAFT_KEY);
      setSidePanelOpen(false);
      
    } catch (error) {
      console.error("Failed to save trade:", error);
      alert("Error saving trade to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full relative">
      
      {/* Indicador de Autosave y Hotkeys */}
      <div className="bg-[#141414] border-b border-[#262626] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-widest">Draft Autosaved</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#525252]">
          <Keyboard size={12} />
          <span>Alt + Hotkeys Enabled</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* SECTION 1: PRE-TRADE */}
        <section>
          <h3 className="text-sm font-mono text-[#d4d4d4] border-b border-[#262626] pb-2 mb-4 uppercase tracking-wider">
            1. Pre-Trade Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-mono text-[#737373] mb-1">Market</label>
              <input type="text" name="market" value={formData.market} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" required />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="flex items-center justify-between text-xs font-mono text-[#737373] mb-1">
                Session <span className="text-[#525252]">Alt+1..4</span>
              </label>
              <select name="session" value={formData.session} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors">
                <option value="NY_AM">NY AM (1)</option>
                <option value="NY_PM">NY PM (2)</option>
                <option value="London">London (3)</option>
                <option value="Asia">Asia (4)</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-mono text-[#737373] mb-1">HTF Trend</label>
              <select name="trend" value={formData.trend} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors">
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
                <option value="Sideways">Sideways</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-mono text-[#737373] mb-1">Entry Time (HH:MM)</label>
              <input type="time" name="entryTime" value={formData.entryTime} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" required />
            </div>

            {/* Dirección - Botones Rápidos */}
            <div className="col-span-2">
              <label className="flex items-center justify-between text-xs font-mono text-[#737373] mb-2">
                Direction <span className="text-[#525252]">Alt+L / Alt+S</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({...formData, direction: 'Long'})} className={`py-1.5 rounded text-sm font-mono transition-colors border ${formData.direction === 'Long' ? 'bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB]' : 'bg-[#141414] border-[#262626] text-[#737373] hover:border-[#525252]'}`}>
                  Long (L)
                </button>
                <button type="button" onClick={() => setFormData({...formData, direction: 'Short'})} className={`py-1.5 rounded text-sm font-mono transition-colors border ${formData.direction === 'Short' ? 'bg-[#991B1B]/20 border-[#991B1B] text-[#991B1B]' : 'bg-[#141414] border-[#262626] text-[#737373] hover:border-[#525252]'}`}>
                  Short (S)
                </button>
              </div>
            </div>

            {/* Checklist Dinámico de Confirmaciones */}
            <div className="col-span-2 mt-2">
              <label className="flex items-center gap-2 text-xs font-mono text-[#737373] mb-2">
                <CheckSquare size={14} /> Strategy Confirmations
              </label>
              {strategyRules.length > 0 ? (
                <div className="space-y-2 bg-[#141414] p-3 rounded border border-[#262626]">
                  {strategyRules.map((rule, idx) => (
                    <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.confirmations.includes(rule)} 
                        onChange={() => toggleConfirmation(rule)}
                        className="mt-0.5 accent-[#2563EB] bg-[#0a0a0a] border-[#525252] rounded-sm cursor-pointer"
                      />
                      <span className={`text-xs font-mono transition-colors ${formData.confirmations.includes(rule) ? 'text-[#d4d4d4]' : 'text-[#737373] group-hover:text-[#a3a3a3]'}`}>
                        {rule}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="bg-[#141414] border border-[#262626] border-dashed rounded p-3 text-center">
                  <span className="text-xs font-mono text-[#525252]">No rules defined in active strategy playbook.</span>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* SECTION 2: MANAGEMENT */}
        <section>
          <h3 className="text-sm font-mono text-[#d4d4d4] border-b border-[#262626] pb-2 mb-4 uppercase tracking-wider">
            2. Execution & Risk
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Outcome - Botones Rápidos */}
            <div className="col-span-2">
              <label className="flex items-center justify-between text-xs font-mono text-[#737373] mb-2">
                Outcome <span className="text-[#525252]">Alt + T/O/B/N</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'TP', label: 'TP (T)', color: 'border-[#2563EB] bg-[#2563EB]/20 text-[#2563EB]' },
                  { id: 'SL', label: 'SL (O)', color: 'border-[#991B1B] bg-[#991B1B]/20 text-[#991B1B]' },
                  { id: 'BE', label: 'BE (B)', color: 'border-[#d4d4d4] bg-[#d4d4d4]/10 text-[#d4d4d4]' },
                  { id: 'NT', label: 'NT (N)', color: 'border-[#525252] bg-[#141414] text-[#737373]' }
                ].map(out => (
                  <button 
                    key={out.id} type="button" 
                    onClick={() => setFormData({...formData, outcome: out.id as TradeOutcome})} 
                    className={`py-1.5 rounded text-xs font-mono transition-colors border ${formData.outcome === out.id ? out.color : 'bg-[#141414] border-[#262626] text-[#737373] hover:border-[#525252]'}`}
                  >
                    {out.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="col-span-2 sm:col-span-1 relative mt-2">
              <label className="block text-xs font-mono text-[#737373] mb-1">Risk (%)</label>
              <input 
                type="number" step="0.1" min="0" name="riskPercentage" 
                value={formData.riskPercentage} 
                onChange={handleChange} 
                className={`w-full bg-[#141414] border rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:outline-none transition-colors ${isRiskWarning ? 'border-[#facc15] focus:border-[#facc15]' : 'border-[#262626] focus:border-[#525252]'}`} 
                required 
              />
            </div>

            <div className="col-span-2 sm:col-span-1 mt-2">
              <label className="block text-xs font-mono text-[#737373] mb-1">Net PnL (USD)</label>
              <input type="number" step="0.01" name="pnlUSD" value={formData.pnlUSD} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" required />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-mono text-[#737373] mb-1">Planned R:R</label>
              <input type="number" step="0.1" name="plannedRR" value={formData.plannedRR} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-mono text-[#737373] mb-1">Achieved R:R</label>
              <input type="number" step="0.1" name="achievedRR" value={formData.achievedRR} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-mono text-[#737373] mb-1">Max Drawdown (Ticks/Pts)</label>
              <input type="number" step="0.5" name="maxDrawdown" value={formData.maxDrawdown} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" />
            </div>
          </div>
        </section>

        {/* SECTION 3: VISUAL LOGS */}
        <section>
          <h3 className="text-sm font-mono text-[#d4d4d4] border-b border-[#262626] pb-2 mb-4 uppercase tracking-wider">
            3. Visual Logs
          </h3>
          <div className="space-y-3">
            {[
              { id: 'analysisUrl', label: 'HTF Chart URL' },
              { id: 'entryUrl', label: 'Entry Chart URL' },
              { id: 'resultUrl', label: 'Result Chart URL' }
            ].map(field => (
              <div key={field.id}>
                <label className="block text-xs font-mono text-[#737373] mb-1">{field.label}</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    name={field.id} 
                    value={(formData as any)[field.id]} 
                    onChange={handleChange} 
                    placeholder="https://..." 
                    className="flex-1 bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] focus:outline-none transition-colors" 
                  />
                  {(formData as any)[field.id] && (
                    <a 
                      href={(formData as any)[field.id]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#262626] hover:bg-[#404040] text-[#d4d4d4] px-3 rounded flex items-center justify-center transition-colors shrink-0"
                      title="Preview Image"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: EVALUATION */}
        <section>
          <h3 className="text-sm font-mono text-[#d4d4d4] border-b border-[#262626] pb-2 mb-4 uppercase tracking-wider">
            4. Retrospective
          </h3>
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Selector de Estrellas (Calidad) */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-mono text-[#737373] mb-2">Execution Quality</label>
                <div className="flex gap-1.5 bg-[#141414] border border-[#262626] rounded px-3 py-2 w-fit">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={18} 
                      onClick={() => setFormData({...formData, executionQuality: star})}
                      className={`cursor-pointer transition-colors ${star <= formData.executionQuality ? 'text-[#FACC15] fill-[#FACC15]' : 'text-[#404040] hover:text-[#737373]'}`} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-mono text-[#737373] mb-1">Primary Error</label>
                <select name="primaryError" value={formData.primaryError} onChange={handleChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-sm font-mono text-[#d4d4d4] focus:border-[#FACC15] focus:outline-none transition-colors">
                  <option value="None">None (Flawless)</option>
                  <option value="FOMO">FOMO</option>
                  <option value="Patience">Lack of Patience</option>
                  <option value="Outside_Plan">Outside Plan</option>
                  <option value="Overtrading">Overtrading</option>
                  <option value="Early_Exit">Early Exit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#737373] mb-1">Trade Notes</label>
              <textarea name="tradeNotes" value={formData.tradeNotes} onChange={handleChange} rows={3} placeholder="Insights, emotions, lessons..." className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-sm font-mono text-[#d4d4d4] focus:border-[#525252] focus:outline-none resize-none transition-colors"></textarea>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER DEL FORMULARIO CON ALERTA DE RIESGO */}
      <div className="border-t border-[#262626] bg-[#0a0a0a] flex flex-col shrink-0">
        
        {isRiskWarning && (
          <div className="bg-[#facc15]/10 border-b border-[#facc15]/20 px-6 py-2.5 flex items-center gap-3">
            <AlertTriangle size={16} className="text-[#facc15] shrink-0" />
            <p className="text-[#facc15] text-xs font-mono">
              Risk Warning: {formData.riskPercentage}% exceeds limit of {maxRiskAllowed}%.
            </p>
          </div>
        )}

        <div className="h-16 flex items-center justify-between px-6">
          <span className="text-[10px] text-[#525252] font-mono">Tip: Press Enter to save</span>
          <button
            type="submit"
            disabled={isSubmitting || !currentStrategyId}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-2 rounded font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={16} strokeWidth={2} />
            <span className="text-sm font-mono tracking-wide">{isSubmitting ? 'Saving...' : 'Log Trade'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};