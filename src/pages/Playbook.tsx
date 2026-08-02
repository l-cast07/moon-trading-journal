// src/pages/Playbook.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Target, ShieldCheck, Plus, Settings2, Activity, Star, Flame, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { StrategyModal } from '../components/modals/StrategyModal';
import { LightboxModal } from '../components/modals/LightboxModal';
import { useMoonStore } from '../store/useMoonStore';
import { getStrategyById, getTradesByStrategy, updateTrade } from '../data/queries';
import { Strategy, Trade } from '../types';
import { Calendar } from '../components/calendar/Calendar';

type TabType = 'RULES' | 'DAILY' | 'MASTERS';

export const Playbook: React.FC = () => {
  const { currentStrategyId, selectedDate, setSidePanelOpen } = useMoonStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('RULES');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Consulta de datos de la estrategia y sus trades
  useEffect(() => {
    if (currentStrategyId) {
      getStrategyById(currentStrategyId).then(data => {
        if (data) setStrategy(data);
      });
      getTradesByStrategy(currentStrategyId).then(setTrades);
    } else {
      setStrategy(null);
      setTrades([]);
    }
  }, [currentStrategyId]);

  // Si seleccionamos una fecha en el calendario, cambiamos automáticamente a la pestaña 'DAILY'
  // y cerramos el SidePanel (ya que el calendario del Index lo abre por defecto)
  useEffect(() => {
    if (selectedDate) {
      setActiveTab('DAILY');
      setSidePanelOpen(false); 
    }
  }, [selectedDate, setSidePanelOpen]);

  // Filtros de Trades
  const dailyTrades = useMemo(() => 
    trades.filter(t => t.date === selectedDate), 
  [trades, selectedDate]);

  const masterTrades = useMemo(() => 
    trades.filter(t => t.isFavorite), 
  [trades]);

  // Función para Promover / Degradar un Trade (Favoritos)
  const toggleFavorite = async (trade: Trade) => {
    try {
      const newStatus = !trade.isFavorite;
      await updateTrade(trade.id, { isFavorite: newStatus });
      setTrades(prev => prev.map(t => t.id === trade.id ? { ...t, isFavorite: newStatus } : t));
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      <StrategyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* LIGHTBOX MODAL */}
      <LightboxModal 
        isOpen={!!lightboxImage} 
        imageUrl={lightboxImage} 
        onClose={() => setLightboxImage(null)} 
      />

      {/* Cabecera Principal */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-mono text-[#d4d4d4] tracking-tight">Playbook & Library</h1>
          <p className="text-sm text-[#737373] mt-1 font-mono">Master Setups and Operational Guidelines</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#141414] border border-[#262626] text-[#d4d4d4] px-4 py-2 rounded font-medium hover:border-[#404040] hover:bg-[#1a1a1a] transition-colors shadow-sm"
        >
          <Settings2 size={16} strokeWidth={2} />
          <span className="text-sm font-mono">Edit Profile</span>
        </button>
      </div>

      {/* LAYOUT PRO 30/70 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* =========================================================
            ZONA IZQUIERDA (30%) - ÍNDICE TEMPORAL (CALENDARIO)
            ========================================================= */}
        <div className="lg:col-span-4 border border-[#262626] rounded-lg bg-[#0f0f0f] shadow-inner overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#262626] bg-[#0a0a0a] shrink-0">
            <h2 className="text-xs font-mono text-[#737373] uppercase tracking-widest">Temporal Index</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="transform scale-[0.95] origin-top">
              <Calendar />
            </div>
          </div>
        </div>

        {/* =========================================================
            ZONA DERECHA (70%) - ÁREA DE ESTUDIO
            ========================================================= */}
        <div className="lg:col-span-8 border border-[#262626] rounded-lg bg-[#0f0f0f] shadow-inner flex flex-col overflow-hidden">
          
          {/* Navegación de Pestañas */}
          <div className="flex items-center border-b border-[#262626] bg-[#0a0a0a] px-2 shrink-0">
            <TabButton 
              active={activeTab === 'RULES'} 
              onClick={() => setActiveTab('RULES')} 
              icon={<BookOpen size={16} />} 
              label="Rules & Manifesto" 
            />
            <TabButton 
              active={activeTab === 'DAILY'} 
              onClick={() => setActiveTab('DAILY')} 
              icon={<Activity size={16} />} 
              label={selectedDate ? `Log: ${selectedDate}` : 'Daily Log'} 
              disabled={!selectedDate}
            />
            <TabButton 
              active={activeTab === 'MASTERS'} 
              onClick={() => setActiveTab('MASTERS')} 
              icon={<Flame size={16} />} 
              label={`Master Setups (${masterTrades.length})`} 
            />
          </div>

          {/* Contenido Dinámico de la Zona Derecha */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            
            {/* --- PESTAÑA: RULES & MANIFESTO --- */}
            {activeTab === 'RULES' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Manifesto */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-mono text-[#d4d4d4] border-b border-[#262626] pb-2 mb-4 uppercase tracking-widest">
                    <Target className="text-[#525252]" size={18} /> Philosophy & Manifesto
                  </h3>
                  <div className="bg-[#141414] border border-[#262626] rounded p-4 text-[#d4d4d4] font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner border-l-4 border-l-[#2563EB]">
                    {strategy?.manifesto || "Define tu ancla mental y filosofía como trader en la configuración del perfil."}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Golden Rules */}
                  <section className="bg-[#0a0a0a] border border-[#262626] rounded p-5">
                    <h3 className="flex items-center gap-2 text-xs font-mono text-[#737373] uppercase tracking-widest mb-4">
                      <ShieldCheck className="text-[#525252]" size={16} /> Golden Rules
                    </h3>
                    <div className="text-[#d4d4d4] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {strategy?.rules || "No golden rules defined."}
                    </div>
                  </section>

                  {/* Market Context & Risk */}
                  <section className="space-y-6">
                    <div className="bg-[#0a0a0a] border border-[#262626] rounded p-5">
                      <h3 className="text-xs font-mono text-[#737373] uppercase tracking-widest mb-3">Market Context</h3>
                      <div className="text-[#d4d4d4] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {strategy?.marketContext || "No context rules defined."}
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#262626] rounded p-5">
                      <h3 className="text-xs font-mono text-[#737373] uppercase tracking-widest mb-3">Risk Parameters</h3>
                      <div className="text-[#d4d4d4] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {strategy?.riskParameters || "No risk parameters defined."}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* --- PESTAÑA: DAILY LOG --- */}
            {activeTab === 'DAILY' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-mono text-[#d4d4d4]">Execution Log for {selectedDate}</h3>
                  <span className="bg-[#141414] border border-[#262626] px-3 py-1 rounded text-xs font-mono text-[#737373]">
                    {dailyTrades.length} Trades Recorded
                  </span>
                </div>

                {dailyTrades.length === 0 ? (
                  <div className="border border-[#262626] border-dashed rounded-lg bg-[#0a0a0a] p-10 text-center">
                    <p className="text-[#525252] font-mono text-sm">No operations recorded on this date.</p>
                  </div>
                ) : (
                  dailyTrades.map(trade => (
                    <TradeCard 
                      key={trade.id} 
                      trade={trade} 
                      onToggleFavorite={() => toggleFavorite(trade)} 
                      onImageClick={setLightboxImage} 
                    />
                  ))
                )}
              </div>
            )}

            {/* --- PESTAÑA: MASTER SETUPS --- */}
            {activeTab === 'MASTERS' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-mono text-[#d4d4d4] flex items-center gap-2">
                    <Flame className="text-[#FACC15]" size={20} /> Master Setups Catalog
                  </h3>
                  <p className="text-xs text-[#737373] font-mono mt-1">Study your highest quality executions to build pattern recognition.</p>
                </div>

                {masterTrades.length === 0 ? (
                  <div className="border border-[#262626] border-dashed rounded-lg bg-[#0a0a0a] p-10 text-center flex flex-col items-center">
                    <Star className="text-[#262626] mb-3" size={32} />
                    <p className="text-[#525252] font-mono text-sm">Your library is empty.</p>
                    <p className="text-[#404040] text-xs font-mono mt-1">Go to a Daily Log and click "Promote to Playbook" on your 5-star trades.</p>
                  </div>
                ) : (
                  masterTrades.map(trade => (
                    <TradeCard 
                      key={trade.id} 
                      trade={trade} 
                      onToggleFavorite={() => toggleFavorite(trade)} 
                      onImageClick={setLightboxImage} 
                      isMasterView
                    />
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENTES UI
// ==========================================

const TabButton = ({ active, onClick, icon, label, disabled = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-widest transition-all border-b-2 ${
      active 
        ? 'border-[#2563EB] text-[#d4d4d4] bg-[#0f0f0f]' 
        : 'border-transparent text-[#525252] hover:text-[#d4d4d4] hover:bg-[#141414]'
    } ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-[#525252]' : ''}`}
  >
    {icon} {label}
  </button>
);

const TradeCard = ({ trade, onToggleFavorite, onImageClick, isMasterView = false }: { trade: Trade, onToggleFavorite: () => void, onImageClick: (url: string) => void, isMasterView?: boolean }) => {
  const isProfitable = trade.management.pnlUSD >= 0;
  const pnlColor = isProfitable ? 'text-[#2563EB]' : 'text-[#991B1B]';

  return (
    <div className={`border rounded-lg bg-[#0a0a0a] p-5 relative overflow-hidden transition-all ${trade.isFavorite ? 'border-[#FACC15]/30' : 'border-[#262626]'}`}>
      
      {/* Etiqueta de Master Setup */}
      {trade.isFavorite && isMasterView && (
        <div className="absolute top-0 right-0 bg-[#FACC15]/10 text-[#FACC15] px-3 py-1 text-[9px] uppercase tracking-widest font-mono font-bold rounded-bl-lg border-b border-l border-[#FACC15]/20">
          Master Setup
        </div>
      )}

      {/* Cabecera del Trade */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[#d4d4d4] font-bold">{trade.preTrade.market}</span>
            <span className="font-mono text-[10px] text-[#737373] bg-[#141414] px-2 py-0.5 rounded uppercase tracking-wider">{trade.preTrade.session}</span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${trade.preTrade.direction === 'Long' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {trade.preTrade.direction}
            </span>
          </div>
          <p className="text-xs font-mono text-[#525252]">{isMasterView ? `Date: ${trade.date} | ` : ''}Entry Time: {trade.preTrade.entryTime}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`font-mono text-xl font-bold ${pnlColor}`}>
            {isProfitable ? '+' : ''}{trade.management.pnlUSD.toFixed(2)}
          </span>
          <button 
            onClick={onToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-mono uppercase tracking-widest transition-colors ${
              trade.isFavorite 
                ? 'bg-[#FACC15]/10 border-[#FACC15]/30 text-[#FACC15] hover:bg-[#FACC15]/20' 
                : 'bg-[#141414] border-[#262626] text-[#737373] hover:text-[#d4d4d4] hover:border-[#404040]'
            }`}
          >
            <Star size={12} className={trade.isFavorite ? 'fill-[#FACC15]' : ''} />
            {trade.isFavorite ? 'Demote' : 'Promote to Playbook'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Metricas */}
        <div className="bg-[#0f0f0f] border border-[#262626] rounded p-3 grid grid-cols-2 gap-2 text-xs font-mono">
          <div><span className="text-[#525252]">Risk:</span> <span className="text-[#d4d4d4]">{trade.management.riskPercentage}%</span></div>
          <div><span className="text-[#525252]">RR Plan:</span> <span className="text-[#d4d4d4]">1:{trade.management.plannedRR}</span></div>
          <div><span className="text-[#525252]">RR Act:</span> <span className="text-[#d4d4d4]">1:{trade.management.achievedRR}</span></div>
          <div><span className="text-[#525252]">Outcome:</span> <span className="text-[#d4d4d4]">{trade.management.outcome}</span></div>
        </div>

        {/* Psicologia */}
        <div className="bg-[#0f0f0f] border border-[#262626] rounded p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#525252]">Execution Quality</span>
            <div className="flex gap-0.5 text-[#FACC15]">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={14} className={star <= trade.evaluation.executionQuality ? 'fill-[#FACC15]' : 'text-[#262626]'} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
             <span className="text-xs font-mono text-[#525252]">Primary Error</span>
             <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${trade.evaluation.primaryError !== 'None' ? 'bg-[#FACC15]/20 text-[#FACC15]' : 'text-[#737373]'}`}>
               {trade.evaluation.primaryError.replace('_', ' ')}
             </span>
          </div>
        </div>
      </div>

      {/* Checklist / Factores RE-ESTRUCTURADO */}
      {trade.preTrade.confirmations.length > 0 && (
        <div className="mb-4 border-l-2 border-[#262626] pl-3">
           <span className="text-[10px] font-mono text-[#737373] uppercase tracking-widest block mb-2">Execution Factors</span>
           <div className="flex flex-wrap gap-2">
             {trade.preTrade.confirmations.map((conf: any) => (
               <div key={conf.id || crypto.randomUUID()} className="flex items-center bg-[#141414] border border-[#262626] rounded px-2 py-1 text-[10px] font-mono shadow-sm">
                 <span className="font-bold text-[#2563EB] mr-1">{conf.type || conf}</span>
                 {conf.timeframe && <span className="text-[#737373]">({conf.timeframe})</span>}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Notas */}
      {trade.evaluation.tradeNotes && (
        <div className="mb-4 bg-[#141414] p-3 rounded text-xs font-mono text-[#d4d4d4] border border-[#262626] whitespace-pre-wrap">
          {trade.evaluation.tradeNotes}
        </div>
      )}

      {/* Galería de Imágenes Visuales */}
      {(trade.visuals.analysisUrl || trade.visuals.entryUrl || trade.visuals.resultUrl) && (
        <div className="border-t border-[#262626] pt-4 mt-2">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-widest block mb-3">Visual Logs</span>
          <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            {trade.visuals.analysisUrl && <ImageThumbnail url={trade.visuals.analysisUrl} label="HTF Analysis" onClick={() => onImageClick(trade.visuals.analysisUrl)} />}
            {trade.visuals.entryUrl && <ImageThumbnail url={trade.visuals.entryUrl} label="Entry Trigger" onClick={() => onImageClick(trade.visuals.entryUrl)} />}
            {trade.visuals.resultUrl && <ImageThumbnail url={trade.visuals.resultUrl} label="Trade Result" onClick={() => onImageClick(trade.visuals.resultUrl)} />}
          </div>
        </div>
      )}
    </div>
  );
};

const ImageThumbnail = ({ url, label, onClick }: { url: string, label: string, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="relative group cursor-pointer w-40 h-24 shrink-0 rounded border border-[#262626] overflow-hidden bg-[#141414] flex items-center justify-center"
    >
      {/* Intenta cargar como imagen. Si es un link de TradingView roto, se verá el fallback visual */}
      <img src={url} alt={label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      
      {/* Fallback & Overlay UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/50 group-hover:bg-transparent transition-colors">
        <ImageIcon size={18} className="text-[#737373] mb-1 group-hover:opacity-0 transition-opacity" />
        <span className="text-[10px] font-mono font-bold text-[#d4d4d4] bg-[#0a0a0a]/80 px-2 py-0.5 rounded">{label}</span>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2563EB] p-1 rounded text-white shadow-lg">
        <ZoomIn size={14} />
      </div>
    </div>
  );
};