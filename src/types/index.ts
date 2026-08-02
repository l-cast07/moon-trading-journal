// src/types/index.ts

export interface TradeConfirmation {
  id: string;        // Para facilitar el borrado en React
  type: string;      // ej. "FVG+"
  timeframe: string; // ej. "15m"
}

export type ConfirmationType = 'FVG+' | 'FVG-' | 'ITL' | 'ITH' | 'OB' | 'SWEEP.H' | 'SWEEP.L' | 'BOS' | 'CHOCH' | 'UMT FVG-' | 'UMT FVG+' | 'LO.H' | 'LO.L' | 'AS.H' | 'AS.L' | 'NY.H' | 'NY.L';
export type Timeframe = '1m' | '2m' | '3m' | '4m' | '5m' | '15m' | '1H' | '4H' | 'D';
/**
 * Valid trading sessions for market filtering
 */
export type TradingSession = 'NY_AM' | 'NY_PM' | 'Asia' | 'London';

/**
 * Trend direction configurations
 */
export type MarketTrend = 'Bullish' | 'Bearish' | 'Sideways';

/**
 * Trade execution direction
 */
export type TradeDirection = 'Long' | 'Short';

/**
 * Fixed trade outcomes
 */
export type TradeOutcome = 'TP' | 'SL' | 'BE' | 'NT'; // Take Profit, Stop Loss, Breakeven, No Trade

/**
 * Predefined psychological or tactical execution errors
 */
export type ExecutionError = 'FOMO' | 'Patience' | 'Outside_Plan' | 'Overtrading' | 'Early_Exit' | 'None';

/**
 * Strategy Profile Metadata (Versión Pro)
 */
export interface Strategy {
  id: string;
  name: string;
  initialCapital: number;
  createdAt: number;
  rules?: string;
  marketContext?: string;
  riskParameters?: string;
  manifesto?: string;
  allowedConfirmations?: string[]; // <-- NUEVO: Guarda las confirmaciones permitidas (ej. ['FVG+', 'OB'])
}

/**
 * Section 1: Pre-Trade Analysis Context
 */
export interface PreTradeAnalysis {
  market: string;
  session: TradingSession;
  trend: MarketTrend;
  direction: TradeDirection;
  entryTime: string;
  confirmations: TradeConfirmation[]; // <-- MODIFICADO
}

/**
 * Section 2: Mathematical Trade Risk Management
 */
export interface TradeManagement {
  riskPercentage: number;      // Capital percentage risked (e.g., 1.0 for 1%)
  plannedRR: number;           // Target Risk-to-Reward ratio (e.g., 3.0)
  achievedRR: number;          // Executed Risk-to-Reward ratio (e.g., -1.0 for SL, 3.0 for TP)
  maxDrawdown: number;         // Maximum adverse excursion (MAE) or drawdown suffered during trade
  outcome: TradeOutcome;       // Final result status
  pnlUSD: number;              // Net absolute gain or loss calculated automatically
}

/**
 * Section 3: Visual Logs Storage References
 */
export interface VisualLogs {
  analysisUrl: string;         // URL reference to HTF/Macro structure chart
  entryUrl: string;            // URL reference to precise entry execution chart
  resultUrl: string;           // URL reference to exit/post-trade chart
}

/**
 * Section 4: Performance Evaluation & Mental Framework
 */
export interface PerformanceEvaluation {
  executionQuality: number;    // Quality score rating from 1 to 5 stars (Selector de calidad)
  primaryError: ExecutionError;// Tracked behavior defect metric
  tradeNotes: string;          // Open narrative text block for retrospective review
}

/**
 * Unified Core Structure for every Trade entry in MOON (Versión Pro)
 */
export interface Trade {
  id: string;                               // Unique UUID or database primary key
  strategyId: string;                       // Reference link tying entry to its specific strategy profile
  date: string;                             // Temporal anchor string formatted as ISO date (YYYY-MM-DD)
  timestamp: number;                        // Unix numeric reference timestamp for quick chronological queries
  preTrade: PreTradeAnalysis;               // Structure tracking pre-flight indicators
  management: TradeManagement;              // Structure tracking mathematical execution metrics
  visuals: VisualLogs;                      // Structure tracking chart image references
  evaluation: PerformanceEvaluation;        // Structure tracking behavioral health metrics
  
  // SETUP MAESTRO
  isFavorite?: boolean;                     // Flag para promover el trade a la galería de Setups Maestros del Playbook (Nuevo)
}

/**
 * Weekly aggregation summary container for Column 8 of the Calendar Component
 */
export interface WeeklySummary {
  weekIndex: number;           // Identifier row index for the calendar layout (0 through 5)
  totalPnL: number;            // Summarized absolute profit or loss for the 7 preceding cells
  tradeCount: number;          // Numerical frequency tracker of absolute operations executed
}

/**
 * Structure of the Backup package generated when exporting data (.json)
 */
export interface MoonBackupPayload {
  version: string;             // Active software iteration tag for reverse compatibility checks
  exportedAt: number;          // Unix tracking timestamp for historical tracking purposes
  strategies: Strategy[];      // Entire backed up database snapshot array containing strategy configurations
  trades: Trade[];             // Entire backed up database snapshot array containing documented operations
}