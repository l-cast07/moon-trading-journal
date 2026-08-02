// src/data/queries.ts

import { db } from './db';
import { Trade, Strategy } from '../types';

// ==========================================
// STRATEGY QUERIES
// ==========================================
export const updateStrategy = async (id: string, updates: Partial<Strategy>): Promise<number> => {
  return await db.strategies.update(id, updates);
};
/**
 * Creates a new strategy profile
 */
export const addStrategy = async (strategy: Strategy): Promise<string> => {
  return await db.strategies.add(strategy);
};

/**
 * Retrieves all saved strategies
 */
export const getAllStrategies = async (): Promise<Strategy[]> => {
  return await db.strategies.orderBy('createdAt').reverse().toArray();
};

/**
 * Retrieves a specific strategy by its ID
 */
export const getStrategyById = async (id: string): Promise<Strategy | undefined> => {
  return await db.strategies.get(id);
};

// ==========================================
// TRADE QUERIES
// ==========================================

/**
 * Inserts a new trade into the database
 */
export const addTrade = async (trade: Trade): Promise<string> => {
  return await db.trades.add(trade);
};

/**
 * Updates an existing trade completely or partially
 */
export const updateTrade = async (id: string, updates: Partial<Trade>): Promise<number> => {
  return await db.trades.update(id, updates);
};

/**
 * Removes a trade from the database permanently
 */
export const deleteTrade = async (id: string): Promise<void> => {
  return await db.trades.delete(id);
};

/**
 * Retrieves all trades associated with a specific strategy
 * Ordered by date (newest first) for the metrics engine
 */
export const getTradesByStrategy = async (strategyId: string): Promise<Trade[]> => {
  return await db.trades
    .where('strategyId')
    .equals(strategyId)
    .reverse()
    .sortBy('timestamp');
};

/**
 * Retrieves all trades for a specific calendar date and strategy
 * Used specifically for populating the daily SidePanel
 */
export const getTradesByDate = async (strategyId: string, date: string): Promise<Trade[]> => {
  return await db.trades
    .where(['strategyId', 'date'])
    .equals([strategyId, date])
    .toArray();
};

/**
 * Retrieves trades within a specific timestamp range
 * Useful for filtering metrics by "Last 7 Days" or "Current Month"
 */
export const getTradesByDateRange = async (
  strategyId: string,
  startTimestamp: number,
  endTimestamp: number
): Promise<Trade[]> => {
  // We fetch by strategyId first, then filter in memory for complex multi-index operations
  // Dexie is incredibly fast at in-memory filtering for IndexedDB payloads
  const strategyTrades = await getTradesByStrategy(strategyId);
  return strategyTrades.filter(
    (trade) => trade.timestamp >= startTimestamp && trade.timestamp <= endTimestamp
  );
};

/**
 * Retrieves all trades for a specific month and strategy
 * Used for populating the Calendar component
 */
export const getTradesByMonth = async (
  strategyId: string,
  year: number,
  month: number
): Promise<Trade[]> => {
  // Generamos el prefijo del mes en formato YYYY-MM
  // Sumamos 1 al mes porque en JavaScript los meses van de 0 a 11
  const formattedMonth = String(month + 1).padStart(2, '0');
  const datePrefix = `${year}-${formattedMonth}`;

  // Obtenemos todos los trades de la estrategia activa y filtramos en memoria por el prefijo de la fecha
  const strategyTrades = await getTradesByStrategy(strategyId);
  return strategyTrades.filter((trade) => trade.date.startsWith(datePrefix));
};