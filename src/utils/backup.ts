// src/utils/backup.ts

import { db } from '../data/db';
import { MoonBackupPayload } from '../types';

/**
 * Exporta todos los datos de Dexie a un archivo .json descargable
 */
export const exportData = async (): Promise<void> => {
  try {
    const trades = await db.trades.toArray();
    const strategies = await db.strategies.toArray();
    
    const payload: MoonBackupPayload = {
      version: "1.0.0",
      exportedAt: Date.now(),
      strategies,
      trades
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `moon-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
};

/**
 * Importa un archivo .json y sobrescribe la base de datos actual
 */
export const importData = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const payload: MoonBackupPayload = JSON.parse(content);

        // Validaci n b sica para asegurar que es un archivo MOON v lido
        if (!payload.version || !payload.strategies || !payload.trades) {
          throw new Error("Invalid backup file structure");
        }

        // Usamos transacciones de Dexie para asegurar que si algo falla, no se borren los datos a medias
        await db.transaction('rw', db.trades, db.strategies, async () => {
          await db.trades.clear();
          await db.strategies.clear();
          
          if (payload.trades.length > 0) await db.trades.bulkAdd(payload.trades);
          if (payload.strategies.length > 0) await db.strategies.bulkAdd(payload.strategies);
        });
        
        resolve(true);
      } catch (error) {
        console.error("Import failed:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};