// types/index.ts

export interface ITeam {
  id: string;
  name: string;
  format: string;
  packedTeam: string; // Showdown packed format
  preview: string[]; // 포켓몬 이름 배열 (아이콘용)
}

export interface IBattleConfig {
  numPokemon: number; // default: 6
  battleFormat: 'singles' | 'doubles';
  generation: number; // default: 9
  rules: {
    megaEvolution: boolean;
    zMove: boolean;
    dynamax: boolean;
    terastallize: boolean;
    teraTypePreview: boolean;
  };
  p1Model: string;
  p2Model: string;
}

export interface IAiReasoning {
  turn: number;
  p1Reason?: string;
  p2Reason?: string;
}

export interface IBattleLog {
  id: string;
  timestamp: number;
  winner: 'p1' | 'p2' | 'draw' | null;
  totalTurns: number;
  logs: string[];
  aiReasoning: IAiReasoning[];
}