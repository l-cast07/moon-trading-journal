// src/pages/Metrics.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Crosshair, BarChart2, Activity, Target, DollarSign, RefreshCcw, Filter } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, ComposedChart, Scatter
} from 'recharts';
import { useMoonStore } from '../store/useMoonStore';
import { getTradesByStrategy, getStrategyById } from '../data/queries';
import { Trade, Strategy } from '../types';
import { calculateExpectancy, calculateProfitFactor, calculateWinRate } from '../utils/metrics';

type TimeFilter = '7days' | 'month' | 'all';

export const Metrics: React.FC = () => {
  const { currentStrategyId } = useMoonStore();
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Consulta de datos al cargar la página o cambiar de estrategia[cite: 16]
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
  }, [currentStrategyId]);

  // Aplicar Filtro de Tiempo a los Trades
  const filteredTrades = useMemo(() => {
    if (timeFilter === 'all') return trades;
    
    const now = Date.now();
    if (timeFilter === '7days') {
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      return trades.filter(t => t.timestamp >= sevenDaysAgo);
    }
    
    if (timeFilter === 'month') {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      return trades.filter(t => {
        const d = new Date(t.timestamp);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
    }
    
    return trades;
  }, [trades, timeFilter]);

  // Preparación de Curva de Capital y Drawdown Absoluto (USD)
  const equityData = useMemo(() => {
    if (!strategy) return { curve: [], maxDrawdownUsd: 0, totalPnl: 0 };

    let currentBalance = strategy.initialCapital;
    let peak = currentBalance;
    let maxDrawdownUsd = 0;
    
    const curve = [{
      tradeNum: 0,
      date: 'Start',
      balance: currentBalance,
      pnl: 0
    }];

    const sortedTrades = [...filteredTrades].sort((a, b) => a.timestamp - b.timestamp);

    sortedTrades.forEach((trade, index) => {
      currentBalance += trade.management.pnlUSD;
      
      if (currentBalance > peak) peak = currentBalance;
      const drawdown = peak - currentBalance;
      if (drawdown > maxDrawdownUsd) maxDrawdownUsd = drawdown;

      curve.push({
        tradeNum: index + 1,
        date: trade.date,
        balance: currentBalance,
        pnl: trade.management.pnlUSD
      });
    });

    const totalPnl = currentBalance - strategy.initialCapital;

    return { curve, maxDrawdownUsd, totalPnl };
  }, [filteredTrades, strategy]);

  // Cálculos de la Cinta de Salud (KPIs Principales)[cite: 16]
  const kpis = useMemo(() => {
    const rawExpectancy = calculateExpectancy(filteredTrades);
    const rawProfitFactor = calculateProfitFactor(filteredTrades);
    const rawWinRate = calculateWinRate(filteredTrades);
    const initialCapital = strategy?.initialCapital || 10000; 

    // Recovery Ratio = Net Profit / Max Drawdown (Solo si estamos en positivo total)
    const recoveryRatio = equityData.maxDrawdownUsd > 0 && equityData.totalPnl > 0
      ? (equityData.totalPnl / equityData.maxDrawdownUsd).toFixed(2)
      : equityData.totalPnl > 0 ? "∞" : "0.00";

    const pnlPercentage = (equityData.totalPnl / initialCapital) * 100;
    const maxDrawdownPercent = equityData.maxDrawdownUsd > 0 ? (equityData.maxDrawdownUsd / initialCapital) * 100 : 0;

    return {
      expectancy: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rawExpectancy),
      profitFactor: rawProfitFactor.toFixed(2),
      winRate: `${(rawWinRate * 100).toFixed(1)}%`,
      totalPnl: `$${equityData.totalPnl.toFixed(2)} (${pnlPercentage > 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%)`,
      maxDrawdown: `${maxDrawdownPercent.toFixed(2)}%`,
      recoveryRatio: recoveryRatio
    };
  }, [filteredTrades, strategy, equityData]);

  // Datos para Gráfico de Distribución de PnL (Ganadores vs Perdedores)
  const pnlDistribution = useMemo(() => {
    let grossWinning = 0;
    let grossLosing = 0;
    filteredTrades.forEach(t => {
      if (t.management.pnlUSD >= 0) grossWinning += t.management.pnlUSD;
      else grossLosing += Math.abs(t.management.pnlUSD);
    });
    return [
      { name: 'Gross Winning', value: grossWinning },
      { name: 'Gross Losing', value: grossLosing }
    ];
  }, [filteredTrades]);

  // Datos para Matriz de Sesión vs Calidad (Composed Chart con Alertas)
  const sessionMatrixData = useMemo(() => {
    const sessions = ['Asia', 'London', 'NY_AM', 'NY_PM'];
    return sessions.map(session => {
      const sTrades = filteredTrades.filter(t => t.preTrade.session === session);
      const avgQuality = sTrades.length 
        ? sTrades.reduce((sum, t) => sum + t.evaluation.executionQuality, 0) / sTrades.length 
        : 0;
      
      // Alerta si la calidad promedio es < 3 estrellas (Horas Prohibidas)
      const hasAlert = avgQuality > 0 && avgQuality < 3;
      
      return {
        session: session.replace('_', ' '),
        quality: Number(avgQuality.toFixed(1)),
        // Posicionamos el punto rojo ligeramente encima de la barra si hay alerta
        alertDot: hasAlert ? Number(avgQuality.toFixed(1)) + 0.5 : null
      };
    });
  }, [filteredTrades]);

  // Preparación de datos para la Matriz de Errores (Radar Chart)[cite: 16]
  const radarData = useMemo(() => {
    const counts = { FOMO: 0, Patience: 0, Outside_Plan: 0, Overtrading: 0, Early_Exit: 0 };
    filteredTrades.forEach(trade => {
      const error = trade.evaluation.primaryError;
      if (error && error !== 'None' && counts[error as keyof typeof counts] !== undefined) {
        counts[error as keyof typeof counts]++;
      }
    });
    return [
      { subject: 'FOMO', count: counts.FOMO },
      { subject: 'Patience', count: counts.Patience },
      { subject: 'Out of Plan', count: counts.Outside_Plan },
      { subject: 'Overtrading', count: counts.Overtrading },
      { subject: 'Early Exit', count: counts.Early_Exit },
    ];
  }, [filteredTrades]);

  const hasErrorsLogged = radarData.some(data => data.count > 0);

  // Paleta Estricta Daltonismo-friendly
  const COLOR_PROFIT = "#2563EB"; // Azul Intenso
  const COLOR_LOSS = "#991B1B";   // Rojo Carmesí Oscuro
  const COLOR_ALERT = "#FACC15";  // Amarillo Limón

  const isProfitable = equityData.totalPnl >= 0;
  const lineColor = isProfitable ? COLOR_PROFIT : COLOR_LOSS;

  // Tooltip UI[cite: 16]
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f0f] border border-[#262626] p-3 rounded-lg shadow-xl font-mono text-xs">
          <p className="text-[#737373] mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || '#d4d4d4' }} className="font-bold text-sm">
              {p.name}: {typeof p.value === 'number' && p.name !== 'quality' && p.name !== 'alertDot' ? `$${p.value.toFixed(2)}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto pb-6 custom-scrollbar">
      
      {/* Cabecera Pro y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-mono text-[#d4d4d4] tracking-tight">Performance Intelligence</h1>
          <p className="text-sm text-[#737373] mt-1 font-mono">Statistical Edge & Behavioral Diagnostics</p>
        </div>
        
        {/* Filtros de Tiempo */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#262626] rounded-md p-1 shadow-sm shrink-0">
          <Filter size={14} className="text-[#525252] ml-2" />
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="bg-transparent text-[#d4d4d4] font-mono text-sm uppercase tracking-wider py-1.5 px-2 outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0f0f0f]">All History</option>
            <option value="month" className="bg-[#0f0f0f]">Current Month</option>
            <option value="7days" className="bg-[#0f0f0f]">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Nivel 1: Cinta de Salud (KPIs Principales) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard title="Expectancy" value={kpis.expectancy} icon={<TrendingUp size={16}/>} isPositive={!kpis.expectancy.includes('-')} />
        <KpiCard title="Profit Factor" value={kpis.profitFactor} icon={<Activity size={16}/>} isPositive={Number(kpis.profitFactor) >= 1} />
        <KpiCard title="Win Rate" value={kpis.winRate} icon={<Crosshair size={16}/>} isPositive={parseFloat(kpis.winRate) >= 50} />
        <KpiCard title="Total PnL" value={kpis.totalPnl} icon={<DollarSign size={16}/>} isPositive={equityData.totalPnl >= 0} />
        <KpiCard title="Max Drawdown" value={kpis.maxDrawdown} icon={<BarChart2 size={16}/>} isNegativeMetric={true} isPositive={parseFloat(kpis.maxDrawdown) < 5} />
        <KpiCard title="Recovery Ratio" value={kpis.recoveryRatio} icon={<RefreshCcw size={16}/>} isPositive={Number(kpis.recoveryRatio) >= 1.5} />
      </div>

      {/* Nivel 2: Tendencia y Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 h-[300px]">
        
        {/* Equity Curve (60%) */}
        <div className="lg:col-span-3 border border-[#262626] rounded-lg bg-[#0f0f0f] flex flex-col p-5 shadow-inner h-full">
          <h3 className="text-xs font-mono text-[#737373] mb-4 uppercase tracking-widest">Equity Curve</h3>
          <div className="flex-1 w-full min-h-0">
            {equityData.curve.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData.curve} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="tradeNum" stroke="#525252" tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} stroke="#525252" tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} width={55} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke={lineColor} strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#0a0a0a', stroke: lineColor, strokeWidth: 2 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border border-[#262626] border-dashed rounded bg-[#0a0a0a]">
                <p className="text-[#525252] font-mono text-xs">Insufficient data for Equity Curve</p>
              </div>
            )}
          </div>
        </div>

        {/* PnL Distribution (40%) */}
        <div className="lg:col-span-2 border border-[#262626] rounded-lg bg-[#0f0f0f] flex flex-col p-5 shadow-inner h-full">
          <h3 className="text-xs font-mono text-[#737373] mb-4 uppercase tracking-widest">Gross Distribution</h3>
          <div className="flex-1 w-full min-h-0">
            {filteredTrades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#525252" tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <YAxis dataKey="name" type="category" stroke="#525252" tick={{ fill: '#d4d4d4', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#141414' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {pnlDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name.includes('Winning') ? COLOR_PROFIT : COLOR_LOSS} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border border-[#262626] border-dashed rounded bg-[#0a0a0a]">
                <p className="text-[#525252] font-mono text-xs">No distribution data</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Nivel 3: Diagnóstico Conductual */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[300px]">
        
        {/* Radar Chart Errores (40%) */}
        <div className="lg:col-span-2 border border-[#262626] rounded-lg bg-[#0f0f0f] flex flex-col p-5 shadow-inner h-full">
          <h3 className="text-xs font-mono text-[#737373] mb-2 uppercase tracking-widest">Psychology Radar</h3>
          <div className="flex-1 w-full min-h-0">
            {hasErrorsLogged ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#262626" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 9, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Frequency" dataKey="count" stroke={COLOR_ALERT} fill={COLOR_ALERT} fillOpacity={0.2} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f0f0f', borderColor: '#262626', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px' }}
                    itemStyle={{ color: COLOR_ALERT }}
                    labelStyle={{ color: '#d4d4d4', marginBottom: '4px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full border border-[#262626] border-dashed rounded flex flex-col items-center justify-center bg-[#0a0a0a] p-4 text-center">
                <Target size={24} className="text-[#262626] mx-auto mb-2" />
                <p className="text-[#525252] font-mono text-xs">Clean psychology log.</p>
              </div>
            )}
          </div>
        </div>

        {/* Matriz Sesión vs Calidad (60%) */}
        <div className="lg:col-span-3 border border-[#262626] rounded-lg bg-[#0f0f0f] flex flex-col p-5 shadow-inner h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-[#737373] uppercase tracking-widest">Session vs Quality Matrix</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#991B1B]"></div>
              <span className="text-[9px] font-mono text-[#737373] uppercase tracking-wider">Warning Zone (&lt;3 Stars)</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            {filteredTrades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sessionMatrixData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="session" stroke="#525252" tick={{ fill: '#d4d4d4', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} stroke="#525252" tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#141414' }} />
                  <Bar dataKey="quality" name="Avg Quality" fill={COLOR_PROFIT} radius={[4, 4, 0, 0]} barSize={40} />
                  {/* Puntos Rojos de Alerta si el promedio es malo */}
                  <Scatter dataKey="alertDot" name="Danger Zone" fill={COLOR_LOSS} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border border-[#262626] border-dashed rounded bg-[#0a0a0a]">
                <p className="text-[#525252] font-mono text-xs">No session data</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// Sub-componente UI: Tarjeta de KPI Pro
// ==========================================
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isPositive: boolean;
  isNegativeMetric?: boolean; // Para métricas donde "menos es mejor" (como Drawdown)
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, isPositive, isNegativeMetric }) => {
  // Aplicando paleta estricta
  let valueColor = "#d4d4d4"; 
  
  if (value !== "$0.00" && value !== "0.00%" && value !== "$0.00 (+0.00%)") {
    if (isNegativeMetric) {
      // Drawdown: si es positivo (menor al umbral), gris. Si es malo (muy alto), Rojo Carmesí o Amarillo
      valueColor = isPositive ? "#d4d4d4" : "#FACC15"; 
    } else {
      valueColor = isPositive ? "#2563EB" : "#991B1B"; // Azul o Rojo Carmesí
    }
  }

  return (
    <div className="border border-[#262626] rounded-lg bg-[#0f0f0f] p-3 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-2 opacity-80">
        <span className="text-[9px] font-mono text-[#737373] uppercase tracking-widest">{title}</span>
        <div className="text-[#525252]">{icon}</div>
      </div>
      <span className="text-lg md:text-xl font-mono font-bold tracking-tight truncate" style={{ color: valueColor }} title={value}>
        {value}
      </span>
    </div>
  );
};