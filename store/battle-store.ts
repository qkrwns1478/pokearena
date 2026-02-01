import { create } from 'zustand';
import { IBattleConfig, IBattleLog, BattleState } from '@/lib/types';

interface BattleStore {
  config: IBattleConfig;
  currentBattle: BattleState | null;
  logs: string[];
  aiReasoning: { turn: number; p1Reason?: string; p2Reason?: string }[];
  battleHistory: IBattleLog[];
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  
  setConfig: (config: Partial<IBattleConfig>) => void;
  updateBattleState: (state: BattleState) => void;
  addLog: (log: string) => void;
  addAIReasoning: (turn: number, side: 'p1' | 'p2', reason: string) => void;
  saveBattleLog: (log: IBattleLog) => void;
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  resetBattle: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  config: {
    numPokemon: 6,
    battleFormat: 'singles',
    generation: 9,
    rules: {
      megaEvolution: false,
      zMove: false,
      dynamax: false,
      terastallize: true,
      teraTypePreview: false,
    },
    p1Model: 'llama-3.3-70b-versatile',
    p2Model: 'llama-3.3-70b-versatile',
  },
  currentBattle: null,
  logs: [],
  aiReasoning: [],
  battleHistory: [],
  isPlaying: false,
  isPaused: false,
  speed: 1,

  setConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),
  updateBattleState: (state) => set({ currentBattle: state }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  addAIReasoning: (turn, side, reason) =>
    set((state) => {
      const existing = state.aiReasoning.find((r) => r.turn === turn);
      if (existing) {
        return {
          aiReasoning: state.aiReasoning.map((r) =>
            r.turn === turn ? { ...r, [`${side}Reason`]: reason } : r
          ),
        };
      } else {
        return {
          aiReasoning: [
            ...state.aiReasoning,
            { turn, [`${side}Reason`]: reason },
          ],
        };
      }
    }),
  saveBattleLog: (log) =>
    set((state) => ({ battleHistory: [log, ...state.battleHistory] })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPaused: (paused) => set({ isPaused: paused }),
  setSpeed: (speed) => set({ speed }),
  resetBattle: () =>
    set({ currentBattle: null, logs: [], aiReasoning: [], isPlaying: false, isPaused: false }),
}));
