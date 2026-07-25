// src/components/layout/StatusBar.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { BarChart2, TrendingUp, Crosshair, Activity, Plus } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { getTradesByStrategy, getStrategyById } from '../../data/queries';
import { Trade, Strategy } from '../../types';
import { calculateExpectancy, calculateProfitFactor, calculateWinRate } from '../../utils/metrics';

export const StatusBar: React.FC = () => {
  // Conectamos el estado global
  const { currentStrategyId, isSidePanelOpen, setSidePanelOpen } = useMoonStore();
  
  // Estado local
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  // Escuchar la base de datos (se recarga cuando cierras el Panel Lateral)
  useEffect(() => {
    if (!currentStrategyId) {
      setTrades([]);
      setStrategy(null);
      return;
    }
    
    const fetchDashboardData = async () => {
      const [fetchedTrades, fetchedStrategy] = await Promise.all([
        getTradesByStrategy(currentStrategyId),
        getStrategyById(currentStrategyId)
      ]);
      setTrades(fetchedTrades);
      if (fetchedStrategy) setStrategy(fetchedStrategy);
    };

    fetchDashboardData();
  }, [currentStrategyId, isSidePanelOpen]);

  // Cálculos matemáticos en tiempo real
  const kpis = useMemo(() => {
    const winRate = calculateWinRate(trades);
    const profitFactor = calculateProfitFactor(trades);
    const expectancy = calculateExpectancy(trades);
    
    const totalPnL = trades.reduce((sum, t) => sum + (t.management.pnlUSD || 0), 0);
    const currentBalance = (strategy?.initialCapital || 0) + totalPnL;

    return {
      balance: currentBalance,
      winRate: winRate * 100,
      profitFactor,
      expectancy
    };
  }, [trades, strategy]);

  const formatUSD = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex items-center justify-between mb-6 bg-[#0f0f0f] border border-[#262626] rounded-lg p-4 shadow-sm shrink-0">
      <div className="flex items-center gap-6">
        
        {/* Título de la Estrategia */}
        <div>
          <h1 className="text-lg font-mono text-[#d4d4d4] font-bold tracking-tight">
            {strategy?.name || 'No Active Strategy'}
          </h1>
          <p className="text-[10px] text-[#737373] mt-0.5 font-mono uppercase tracking-widest">
            Active Profile
          </p>
        </div>

        {/* Cinta de Salud (Oculta en móviles para evitar colapso visual) */}
        <div className="hidden md:flex items-center gap-6 border-l border-[#262626] pl-6">
          <KpiItem 
            label="Balance" 
            value={formatUSD(kpis.balance)} 
            isPositive={kpis.balance >= (strategy?.initialCapital || 0)} 
            icon={<BarChart2 size={14}/>} 
          />
          <KpiItem 
            label="Win Rate" 
            value={`${kpis.winRate.toFixed(1)}%`} 
            isPositive={kpis.winRate >= 50} 
            icon={<Crosshair size={14}/>} 
          />
          <KpiItem 
            label="Profit Factor" 
            value={kpis.profitFactor.toFixed(2)} 
            isPositive={kpis.profitFactor >= 1} 
            icon={<Activity size={14}/>} 
          />
          <KpiItem 
            label="Expectancy" 
            value={formatUSD(kpis.expectancy)} 
            isPositive={kpis.expectancy > 0} 
            icon={<TrendingUp size={14}/>} 
          />
        </div>
      </div>

      {/* Disparador de alta velocidad para el panel lateral */}
      <button 
        onClick={() => setSidePanelOpen(true)}
        disabled={!currentStrategyId}
        className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm font-bold tracking-wide shrink-0"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline">New Trade</span>
      </button>
    </div>
  );
};

// ==========================================
// Sub-componente UI: Elemento de la Cinta
// ==========================================
interface KpiItemProps {
  label: string;
  value: string | number;
  isPositive: boolean;
  icon: React.ReactNode;
}

const KpiItem: React.FC<KpiItemProps> = ({ label, value, isPositive, icon }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1.5 text-[#737373] text-[10px] uppercase tracking-widest font-mono mb-1">
      {icon}
      <span>{label}</span>
    </div>
    {/* Implementando la paleta estricta: Azul Intenso y Rojo Carmesí Oscuro */}
    <span className={`font-mono font-bold text-sm ${isPositive ? 'text-[#2563EB]' : 'text-[#991B1B]'}`}>
      {value}
    </span>
  </div>
);