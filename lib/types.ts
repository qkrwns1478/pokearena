export interface ITeam {
  id: string;
  name: string;
  format: string;
  packedTeam: string;
  preview: string[];
}

export interface IBattleConfig {
  numPokemon: number;
  battleFormat: 'singles' | 'doubles';
  generation: number;
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

export interface IBattleLog {
  id: string;
  timestamp: number;
  p1TeamName: string;
  p2TeamName: string;
  winner: 'p1' | 'p2' | 'draw';
  totalTurns: number;
  logs: string[];
  aiReasoning: {
    turn: number;
    p1Reason?: string;
    p2Reason?: string;
  }[];
}

export interface AIDecision {
  reasoning: string;
  action: 'move' | 'switch';
  index: number;
  mega?: boolean;
  tera?: boolean;
  zmove?: boolean;
  dynamax?: boolean;
}

export interface BattleState {
  activePokemon: {
    p1: PokemonState | null;
    p2: PokemonState | null;
  };
  field: FieldState;
  turn: number;
}

export interface PokemonState {
  name: string;
  species: string;
  hp: number;
  maxHp: number;
  status: string;
  volatiles: string[];
  stats: { [key: string]: number };
  moves: MoveInfo[];
  ability: string;
  item: string;
  teraType?: string;
}

export interface MoveInfo {
  name: string;
  type: string;
  category: string;
  basePower: number;
  accuracy: number;
  pp: number;
  maxPp: number;
  disabled: boolean;
}

export interface FieldState {
  weather?: string;
  terrain?: string;
  pseudoWeather: string[];
  sideConditions: {
    p1: string[];
    p2: string[];
  };
}
