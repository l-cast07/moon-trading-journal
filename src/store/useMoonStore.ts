// src/store/useMoonStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Strategy } from '../types';

interface MoonState {
  currentStrategyId: string | null;
  selectedDate: string | null;
  isSidePanelOpen: boolean;
  strategies: Strategy[];
  
  setCurrentStrategyId: (id: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSidePanelOpen: (isOpen: boolean) => void;
  setStrategies: (strategies: Strategy[]) => void;
  addStrategyToStore: (strategy: Strategy) => void;
  updateStrategyInStore: (id: string, updates: Partial<Strategy>) => void;
  removeStrategyFromStore: (id: string) => void;
  resetSession: () => void;
}

export const useMoonStore = create<MoonState>()(
  persist(
    (set) => ({
      currentStrategyId: null,
      selectedDate: null,
      isSidePanelOpen: false,
      strategies: [],
      
      setCurrentStrategyId: (id) => set({ currentStrategyId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSidePanelOpen: (isOpen) => set({ isSidePanelOpen: isOpen }),
      setStrategies: (strategies) => set({ strategies }),
      
      addStrategyToStore: (strategy) => 
        set((state) => ({ strategies: [...state.strategies, strategy] })),
        
      updateStrategyInStore: (id, updates) =>
        set((state) => ({
          strategies: state.strategies.map(s => s.id === id ? { ...s, ...updates } : s)
        })),

      removeStrategyFromStore: (id) =>
        set((state) => ({
          strategies: state.strategies.filter(s => s.id !== id),
          // Si borramos la estrategia activa, reseteamos el ID a null
          currentStrategyId: state.currentStrategyId === id ? null : state.currentStrategyId
        })),
        
      resetSession: () => set({ selectedDate: null, isSidePanelOpen: false }),
    }),
    {
      name: 'moon-session-storage',
      partialize: (state) => ({ currentStrategyId: state.currentStrategyId }),
    }
  )
);