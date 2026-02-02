import { Pokemon, Move, Field } from '@smogon/calc';

export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PokemonData {
  id: string;
  species: string;
  level: number;
  ability: string;
  item?: string;
  nature: string;
  evs: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  ivs: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moves: string[];
  teraType?: string;
  // 배틀 중 상태
  currentHP?: number;
  hasTerastallized?: boolean;
  hasDynamaxed?: boolean;
  hasUsedZMove?: boolean;
  hasMegaEvolved?: boolean;
}

export interface Party {
  id: string;
  name: string;
  pokemon: PokemonData[];
}

export interface BattleRules {
  generation: Generation;
  format: '1v1' | '3v3' | '6v6';
  battleType: 'singles' | 'doubles';
  levelCap: 50 | 100;
  allowTerastal: boolean;
  allowDynamax: boolean;
  allowZMoves: boolean;
  allowMega: boolean;
  gimmickUsageLimit: number;
}

export interface BattleState {
  turn: number;
  player1: {
    party: PokemonData[]; // 전체 파티
    entry: PokemonData[]; // 실제 출전 엔트리
    active: PokemonData | null;
    fainted: string[];
    gimmicksUsed: number;
  };
  player2: {
    party: PokemonData[];
    entry: PokemonData[];
    active: PokemonData | null;
    fainted: string[];
    gimmicksUsed: number;
  };
  field: any;
  log: BattleLogEntry[];
}

export interface BattleLogEntry {
  turn: number;
  timestamp: Date;
  type: 'switch' | 'move' | 'damage' | 'faint' | 'info';
  player: 1 | 2;
  message: string;
  details?: any;
}

export interface AIAction {
  type: 'move' | 'switch';
  moveIndex?: number;
  switchTo?: number;
  reasoning?: string;
  // 추가: 특수 기믹 사용
  useTerastal?: boolean;
  useDynamax?: boolean;
  useZMove?: boolean;
  useMega?: boolean;
}

export interface AIRequest {
  playerNumber: 1 | 2;
  myActivePokemon: PokemonData;
  myParty: PokemonData[];
  opponentActivePokemon: PokemonData | null;
  opponentVisibleInfo: Partial<PokemonData>[];
  battleState: {
    turn: number;
    myFainted: string[];
    opponentFainted: string[];
    field: any;
  };
  rules: BattleRules;
  recentLog: BattleLogEntry[];
  // 추가: 사용 가능한 특수 기믹
  availableGimmicks: {
    canTerastallize: boolean;
    canDynamax: boolean;
    canUseZMove: boolean;
    canMegaEvolve: boolean;
  };
}
