// src/components/calendar/Calendar.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMoonStore } from '../../store/useMoonStore';
import { getTradesByMonth } from '../../data/queries';
import { Trade } from '../../types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC = () => {
  const { currentStrategyId, selectedDate, setSelectedDate, setSidePanelOpen } = useMoonStore();
  
  // Estado local para la navegación del calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);

  // Cálculo dinámico de los últimos 5 años (incluyendo el actual)
  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    const years = [];
    for (let i = 4; i >= 0; i--) {
      years.push(current - i);
    }
    return years;
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Consulta a Dexie cada vez que cambias de mes, año o estrategia
  useEffect(() => {
    if (!currentStrategyId) {
      setTrades([]);
      return;
    }
    
    const fetchTrades = async () => {
      const monthTrades = await getTradesByMonth(currentStrategyId, year, month);
      setTrades(monthTrades);
    };
    
    fetchTrades();
  }, [currentDate, currentStrategyId]);

  // Manejadores de Navegación
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };

  // Lógica de generación de la cuadrícula
  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) a 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    // Relleno inicial para alinear el primer día del mes
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    // Inserción de los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = trades.filter(t => t.date === dateStr);
      
      const pnl = dayTrades.reduce((acc, t) => acc + (t.management.pnlUSD || 0), 0);
      const hasErrors = dayTrades.some(t => t.evaluation.primaryError && t.evaluation.primaryError !== 'None');
      
      currentWeek.push({ day, dateStr, trades: dayTrades, pnl, hasErrors });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Relleno final para completar la última semana
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [year, month, trades]);

  // Sistema de Codificación Visual Corregido (Gris Oscuro para Neutros)
  const getCellStyles = (pnl: number, tradeCount: number) => {
    if (tradeCount === 0) {
      return 'bg-[#141414] text-[#737373] hover:bg-[#1a1a1a] border border-[#262626]'; // Día Neutro
    }
    if (pnl >= 0) {
      return 'bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1D4ED8] border border-[#2563EB]'; // Día Rentable
    }
    return 'bg-[#991B1B] text-[#FFFFFF] hover:bg-[#7F1D1D] border border-[#991B1B]'; // Día en Pérdida
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] p-6 rounded-lg border border-[#262626] shadow-inner">
      
      {/* Controles de Navegación del Calendario */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        {/* Selector de Año */}
        <select 
          value={year} 
          onChange={handleYearChange} 
          className="bg-transparent text-[#d4d4d4] font-mono text-lg font-bold hover:bg-[#141414] rounded px-2 py-1 cursor-pointer outline-none border border-transparent hover:border-[#262626] transition-colors"
        >
          {availableYears.map(y => (
            <option key={y} value={y} className="bg-[#0f0f0f] text-[#d4d4d4]">{y}</option>
          ))}
        </select>

        {/* Selectores de Mes Centrales */}
        <div className="flex items-center gap-3 bg-[#141414] border border-[#262626] rounded-md p-1 shadow-sm">
          <button onClick={prevMonth} className="p-1.5 hover:bg-[#262626] rounded text-[#737373] hover:text-[#d4d4d4] transition-colors">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          
          <select 
            value={month} 
            onChange={handleMonthChange} 
            className="bg-transparent text-[#d4d4d4] font-mono font-bold uppercase tracking-wider text-sm cursor-pointer outline-none text-center appearance-none w-28 text-center"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx} className="bg-[#0f0f0f] text-[#d4d4d4] uppercase text-sm">{m}</option>
            ))}
          </select>
          
          <button onClick={nextMonth} className="p-1.5 hover:bg-[#262626] rounded text-[#737373] hover:text-[#d4d4d4] transition-colors">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Spacer invisible para centrado */}
        <div className="w-16"></div> 
      </div>

      {/* Cabeceras de la Rejilla - Fuera del grid flexible para que no se estiren */}
      <div className="grid grid-cols-8 gap-3 mb-2 shrink-0">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUMMARY'].map((d, i) => (
          <div key={d} className={`text-center font-mono text-xs tracking-wider pb-2 border-b border-[#262626]/50 ${i === 7 ? 'text-[#d4d4d4] font-bold' : 'text-[#737373]'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Rejilla Principal (Días + Resumen) - Usa auto-rows-fr para auto-ajustarse a la pantalla */}
      <div className="grid grid-cols-8 gap-3 flex-1 min-h-0 auto-rows-fr">
        
        {/* Renderizado de Filas y Celdas */}
        {calendarWeeks.map((week, wIdx) => {
          
          const weeklyTrades = week.filter(d => d !== null).flatMap(d => d.trades);
          const weeklyPnl = weeklyTrades.reduce((acc, t) => acc + (t.management.pnlUSD || 0), 0);
          const weeklyCount = weeklyTrades.length;

          return (
            <React.Fragment key={wIdx}>
              
              {/* Iteración sobre los 7 días */}
              {week.map((dayData, dIdx) => {
                // Celdas vacías de relleno
                if (!dayData) {
                  return <div key={`empty-${wIdx}-${dIdx}`} className="bg-transparent rounded-lg" />;
                }
                
                const isSelected = selectedDate === dayData.dateStr;
                const cellStyles = getCellStyles(dayData.pnl, dayData.trades.length);

                return (
                  <div 
                    key={dayData.dateStr}
                    onClick={() => {
                      setSelectedDate(dayData.dateStr);
                      setSidePanelOpen(true);
                    }}
                    className={`relative w-full h-full rounded-lg p-2.5 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-200 transform hover:-translate-y-1 ${cellStyles} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] z-10' : ''}`}
                  >
                    {/* Alerta Psicológica */}
                    {dayData.hasErrors && (
                      <svg viewBox="0 0 24 24" className="absolute top-0 right-0 w-8 h-8 drop-shadow-md">
                        <path d="M0,0 L24,0 L24,24 Z" fill="#FACC15" />
                      </svg>
                    )}
                    
                    {/* Número del día */}
                    <span className="font-mono text-base font-bold opacity-90">{dayData.day}</span>
                    
                    {/* Resumen diario */}
                    {dayData.trades.length > 0 && (
                      <div className="text-right font-mono mt-auto flex flex-col items-end">
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-0.5">
                          {dayData.trades.length} Trade{dayData.trades.length > 1 ? 's' : ''}
                        </div>
                        <div className="font-bold text-lg leading-none">
                          {dayData.pnl >= 0 ? '+' : ''}{dayData.pnl.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Columna 8: Resumen Semanal CORREGIDA */}
              {/* Añadido overflow-hidden, gap-1, padding reducido y leading-none para evitar derrames */}
              <div className="w-full h-full bg-[#141414] border border-[#262626] rounded-lg p-1 lg:p-2 flex flex-col justify-center items-center text-center shadow-inner overflow-hidden gap-1">
                <span className="text-[8px] xl:text-[10px] uppercase tracking-widest text-[#737373] font-mono leading-none">
                  Week {wIdx + 1}
                </span>
                <div className={`font-mono font-bold text-sm xl:text-lg leading-none ${weeklyPnl >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                  {weeklyPnl >= 0 ? '+' : ''}{weeklyPnl.toFixed(2)}
                </div>
                <div className="text-[8px] xl:text-[10px] text-[#525252] font-mono uppercase tracking-wider leading-none">
                  {weeklyCount} Trades
                </div>
              </div>

            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};