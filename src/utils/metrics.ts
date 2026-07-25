// src/utils/metrics.ts

import { Trade } from '../types';

// Calcula la tasa de aciertos (Win Rate)
export const calculateWinRate = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.management.outcome === 'TP').length;
  return wins / trades.length;
};

// Calcula el Profit Factor (Suma de ganancias / Suma de pérdidas)
export const calculateProfitFactor = (trades: Trade[]): number => {
  const gains = trades.reduce((sum, t) => t.management.pnlUSD > 0 ? sum + t.management.pnlUSD : sum, 0);
  const losses = Math.abs(trades.reduce((sum, t) => t.management.pnlUSD < 0 ? sum + t.management.pnlUSD : sum, 0));
  
  if (losses === 0) return gains > 0 ? 1 : 0;
  return gains / losses;
};

// Calcula la expectativa matemática media por trade
export const calculateExpectancy = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  return trades.reduce((sum, t) => sum + t.management.pnlUSD, 0) / trades.length;
};

// Calcula el Drawdown Máximo (Caída máxima desde el pico de balance más alto)
export const calculateMaxDrawdown = (trades: Trade[], initialCapital: number): number => {
  if (trades.length === 0 || initialCapital <= 0) return 0;
  
  let peak = initialCapital;
  let currentBalance = initialCapital;
  let maxDrawdownPercent = 0;

  // Ordenamos los trades del más antiguo al más reciente para simular la línea de tiempo
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  sortedTrades.forEach(trade => {
    currentBalance += trade.management.pnlUSD;
    
    // Si el balance actual supera el pico anterior, tenemos un nuevo pico
    if (currentBalance > peak) {
      peak = currentBalance;
    }
    
    // Calculamos el % de caída respecto al pico más alto vigente
    const drawdown = peak - currentBalance;
    const drawdownPercent = peak > 0 ? drawdown / peak : 0;
    
    // Actualizamos el Drawdown máximo si la racha perdedora actual es la peor registrada
    if (drawdownPercent > maxDrawdownPercent) {
      maxDrawdownPercent = drawdownPercent;
    }
  });

  return maxDrawdownPercent; 
};