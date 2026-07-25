// src/data/db.ts

import Dexie, { Table } from 'dexie';
import { Trade, Strategy } from '../types';

export class MoonDatabase extends Dexie {
  strategies!: Table<Strategy, string>;
  trades!: Table<Trade, string>;

  constructor() {
    super('MoonDatabase');

    // Versión 1: Esquema Original
    this.version(1).stores({
      strategies: 'id, name, createdAt',
      trades: 'id, strategyId, date, timestamp, evaluation.primaryError, evaluation.executionQuality'
    });

    // Versión 2: Actualización Pro
    // Añadimos 'isFavorite' a los índices para futuras consultas ultra-rápidas en el Playbook
    this.version(2).stores({
      strategies: 'id, name, createdAt',
      trades: 'id, strategyId, date, timestamp, evaluation.primaryError, evaluation.executionQuality, isFavorite'
    });
  }
}

export const db = new MoonDatabase();