// src/components/forms/HotkeyManager.tsx

import { useEffect } from 'react';
import { TradingSession, TradeDirection, TradeOutcome } from '../../types';

interface UseTradeHotkeysProps {
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * Custom Hook para gestionar los atajos de teclado de alta velocidad en el TradeForm.
 * Usa la tecla 'Alt' combinada con letras o números para registrar datos sin usar el mouse.
 */
export const useTradeHotkeys = ({ setFormData }: UseTradeHotkeysProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar disparar hotkeys si el usuario está escribiendo en un input de texto o textarea
      if (
        e.target instanceof HTMLInputElement && 
        e.target.type !== 'radio' && 
        e.target.type !== 'checkbox'
      ) return;
      
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.altKey) {
        switch(e.key.toLowerCase()) {
          // ==============================
          // 1. SESIONES (Alt + 1, 2, 3, 4)
          // ==============================
          case '1': 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, session: 'NY_AM' as TradingSession })); 
            break;
          case '2': 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, session: 'NY_PM' as TradingSession })); 
            break;
          case '3': 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, session: 'London' as TradingSession })); 
            break;
          case '4': 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, session: 'Asia' as TradingSession })); 
            break;

          // ==============================
          // 2. DIRECCIÓN (Alt + L, S)
          // ==============================
          case 'l': 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, direction: 'Long' as TradeDirection })); 
            break;
          case 's': 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, direction: 'Short' as TradeDirection })); 
            break;

          // ==============================
          // 3. RESULTADO / OUTCOME (Alt + T, O, B, N)
          // ==============================
          case 't': // (T)ake Profit
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, outcome: 'TP' as TradeOutcome })); 
            break; 
          case 'o': // St(o)p Loss 
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, outcome: 'SL' as TradeOutcome })); 
            break; 
          case 'b': // (B)reakeven
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, outcome: 'BE' as TradeOutcome })); 
            break; 
          case 'n': // (N)o Trade
            e.preventDefault(); 
            setFormData((prev: any) => ({ ...prev, outcome: 'NT' as TradeOutcome })); 
            break; 
        }
      }
    };

    // Montamos el "listener" cuando se abre el formulario
    window.addEventListener('keydown', handleKeyDown);
    
    // Lo desmontamos cuando se cierra para evitar fugas de memoria
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setFormData]);
};