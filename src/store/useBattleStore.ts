import { create } from 'zustand';
import { IBattleLog, IAiReasoning } from '@/types';

interface BattleState {
  currentTurn: number;
  battleLog: IBattleLog;
  winner: 'p1' | 'p2' | 'draw' | null;
  
  // [New] AI 처리 중인지 여부 (버튼 비활성화용)
  isProcessing: boolean;
  setProcessing: (loading: boolean) => void;

  setCurrentTurn: (turn: number) => void;
  addLog: (message: string) => void;
  addReasoning: (reasoning: IAiReasoning) => void;
  setWinner: (winner: 'p1' | 'p2' | 'draw') => void;
  resetBattle: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
  currentTurn: 0,
  isProcessing: false, // 초기값
  winner: null,
  battleLog: {
    id: '',
    timestamp: 0,
    winner: null,
    totalTurns: 0,
    logs: [],
    aiReasoning: [],
  },

  setProcessing: (loading) => set({ isProcessing: loading }),
  setCurrentTurn: (turn) => set((state) => ({ currentTurn: turn })),
  
  addLog: (msg) => set((state) => ({
    battleLog: { ...state.battleLog, logs: [...state.battleLog.logs, msg] }
  })),

  addReasoning: (newReason) => set((state) => {
    const existingIndex = state.battleLog.aiReasoning.findIndex(r => r.turn === newReason.turn);
    let updatedReasoning;
    
    if (existingIndex >= 0) {
      const existing = state.battleLog.aiReasoning[existingIndex];
      const merged = { ...existing, ...newReason };
      updatedReasoning = [...state.battleLog.aiReasoning];
      updatedReasoning[existingIndex] = merged;
    } else {
      updatedReasoning = [...state.battleLog.aiReasoning, newReason];
    }

    return {
      currentTurn: newReason.turn,
      battleLog: { ...state.battleLog, aiReasoning: updatedReasoning }
    };
  }),

  setWinner: (winner) => set((state) => ({
    battleLog: { ...state.battleLog, winner },
    isProcessing: false
  })),
  
  resetBattle: () => set({
    currentTurn: 0,
    isProcessing: false,
    winner: null,
    battleLog: {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      winner: null,
      totalTurns: 0,
      logs: [],
      aiReasoning: []
    }
  })
}));