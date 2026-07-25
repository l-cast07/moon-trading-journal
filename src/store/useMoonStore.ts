// src/store/useMoonStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Strategy } from '../types';

interface MoonState {
  // Global State
  currentStrategyId: string | null;
  selectedDate: string | null;     // Format: YYYY-MM-DD
  isSidePanelOpen: boolean;
  strategies: Strategy[];          // Lista de estrategias en memoria

  // Actions
  setCurrentStrategyId: (id: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSidePanelOpen: (isOpen: boolean) => void;
  setStrategies: (strategies: Strategy[]) => void;
  addStrategyToStore: (strategy: Strategy) => void;
  
  // Utility
  resetSession: () => void;
}

export const useMoonStore = create<MoonState>()(
  persist(
    (set) => ({
      // Initial State
      currentStrategyId: null,
      selectedDate: null,
      isSidePanelOpen: false,
      strategies: [],

      // State Modifiers
      setCurrentStrategyId: (id) => set({ currentStrategyId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSidePanelOpen: (isOpen) => set({ isSidePanelOpen: isOpen }),
      
      // Actualiza la lista completa (útil al cargar la app)
      setStrategies: (strategies) => set({ strategies }),
      
      // Añade una sola estrategia a la lista existente (útil al crear una nueva)
      addStrategyToStore: (strategy) => 
        set((state) => ({ strategies: [...state.strategies, strategy] })),
      
      // Resets the volatile state without losing the saved strategy
      resetSession: () => set({ selectedDate: null, isSidePanelOpen: false }),
    }),
    {
      name: 'moon-session-storage', // The key used in localStorage
      // We ONLY persist the currentStrategyId. 
      // We don't want the side panel or the strategy list to persist statically here.
      partialize: (state) => ({ currentStrategyId: state.currentStrategyId }),
    }
  )
);