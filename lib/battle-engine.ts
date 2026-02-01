import { Battle, Pokemon, Teams } from '@pkmn/sim';
import { Dex, TypeName } from '@pkmn/dex';
import { BattleState, PokemonState, FieldState, MoveInfo, AIDecision, IBattleConfig } from './types';
import { buildAIPrompt, parseAIResponse, decisionToCommand } from './ai-agent';

export class BattleEngineWrapper {
  private battle: Battle;
  private gen: number;
  private dex: any;

  constructor(
    p1Team: string,
    p2Team: string,
    config: IBattleConfig
  ) {
    this.gen = config.generation;
    this.dex = Dex.forGen(this.gen);

    const formatId = `gen${this.gen}${config.battleFormat === 'doubles' ? 'doubles' : 'ou'}`;

    this.battle = new Battle({
      formatid: formatId as any,
      p1: { name: 'Player 1', team: p1Team },
      p2: { name: 'Player 2', team: p2Team },
    });

    // Start battle
    this.battle.start();
  }

  getBattle(): Battle {
    return this.battle;
  }

  getCurrentState(): BattleState {
    const p1Active = this.battle.p1.active[0];
    const p2Active = this.battle.p2.active[0];

    return {
      activePokemon: {
        p1: p1Active ? this.parsePokemonState(p1Active, 'p1') : null,
        p2: p2Active ? this.parsePokemonState(p2Active, 'p2') : null,
      },
      field: this.parseFieldState(),
      turn: this.battle.turn,
    };
  }

  private parsePokemonState(pokemon: Pokemon, side: 'p1' | 'p2'): PokemonState {
    const moves: MoveInfo[] = pokemon.moveSlots.map((slot) => {
      const moveData = this.dex.moves.get(slot.move);
      
      return {
        name: slot.move,
        type: moveData?.type || 'Normal',
        category: moveData?.category || 'Status',
        basePower: moveData?.basePower || 0,
        accuracy: moveData?.accuracy === true ? 100 : (moveData?.accuracy || 100),
        pp: slot.pp,
        maxPp: slot.maxpp,
        disabled: typeof slot.disabled === 'string' ? true : !!slot.disabled,
      };
    });

    return {
      name: pokemon.name,
      species: pokemon.species.name,
      hp: pokemon.hp,
      maxHp: pokemon.maxhp,
      status: pokemon.status || '',
      volatiles: Object.keys(pokemon.volatiles),
      stats: pokemon.storedStats,
      moves,
      ability: pokemon.ability,
      item: pokemon.item || '',
      teraType: pokemon.teraType as string | undefined,
    };
  }

  private parseFieldState(): FieldState {
    const weatherId = this.battle.field.weather ? String(this.battle.field.weather) : undefined;
    const terrainId = this.battle.field.terrain ? String(this.battle.field.terrain) : undefined;

    return {
      weather: weatherId,
      terrain: terrainId,
      pseudoWeather: Object.keys(this.battle.field.pseudoWeather),
      sideConditions: {
        p1: Object.keys(this.battle.p1.sideConditions),
        p2: Object.keys(this.battle.p2.sideConditions),
      },
    };
  }

  getRequest(side: 'p1' | 'p2'): any {
    const player = side === 'p1' ? this.battle.p1 : this.battle.p2;
    // @pkmn/sim의 request는 player.request 속성에 저장됨
    return (player as any).request;
  }

  isGameOver(): boolean {
    return this.battle.ended;
  }

  getWinner(): 'p1' | 'p2' | 'draw' | null {
    if (!this.battle.ended) return null;
    if (this.battle.winner === 'Player 1') return 'p1';
    if (this.battle.winner === 'Player 2') return 'p2';
    return 'draw';
  }

  async makeMove(side: 'p1' | 'p2', command: string): Promise<void> {
    this.battle.choose(side, command);
  }

  getLogs(): string[] {
    return this.battle.log;
  }

  getAvailableMoves(side: 'p1' | 'p2'): number {
    const request = this.getRequest(side);
    if (!request?.active?.[0]?.moves) return 0;
    
    return request.active[0].moves.filter(
      (m: any) => !m.disabled && m.pp > 0
    ).length;
  }

  needsChoice(side: 'p1' | 'p2'): boolean {
    const request = this.getRequest(side);
    return !!(request?.active || request?.forceSwitch);
  }
}

export class BattleOrchestrator {
  private engine: BattleEngineWrapper;
  private config: IBattleConfig;
  private onLog: (log: string) => void;
  private onStateUpdate: (state: BattleState) => void;
  private onAIReasoning: (turn: number, side: 'p1' | 'p2', reason: string) => void;
  private shouldStop: boolean = false;

  constructor(
    p1Team: string,
    p2Team: string,
    config: IBattleConfig,
    callbacks: {
      onLog: (log: string) => void;
      onStateUpdate: (state: BattleState) => void;
      onAIReasoning: (turn: number, side: 'p1' | 'p2', reason: string) => void;
    }
  ) {
    this.engine = new BattleEngineWrapper(p1Team, p2Team, config);
    this.config = config;
    this.onLog = callbacks.onLog;
    this.onStateUpdate = callbacks.onStateUpdate;
    this.onAIReasoning = callbacks.onAIReasoning;
  }

  stop(): void {
    this.shouldStop = true;
  }

  async runBattle(): Promise<'p1' | 'p2' | 'draw'> {
    let turn = 0;
    const maxTurns = 100;

    while (!this.engine.isGameOver() && turn < maxTurns && !this.shouldStop) {
      turn++;
      this.onLog(`\n=== Turn ${turn} ===`);

      // Get current state
      const state = this.engine.getCurrentState();
      this.onStateUpdate(state);

      // Check if both players need to make choices
      const p1NeedsChoice = this.engine.needsChoice('p1');
      const p2NeedsChoice = this.engine.needsChoice('p2');

      if (!p1NeedsChoice && !p2NeedsChoice) {
        // Battle might need to process something
        await this.delay(100);
        continue;
      }

      // Get AI decisions in parallel
      const [p1Decision, p2Decision] = await Promise.all([
        p1NeedsChoice ? this.getAIDecision('p1', state) : null,
        p2NeedsChoice ? this.getAIDecision('p2', state) : null,
      ]);

      // Log AI reasoning
      if (p1Decision) {
        this.onAIReasoning(turn, 'p1', p1Decision.reasoning);
        this.onLog(`[P1 AI] ${p1Decision.reasoning}`);
      }
      if (p2Decision) {
        this.onAIReasoning(turn, 'p2', p2Decision.reasoning);
        this.onLog(`[P2 AI] ${p2Decision.reasoning}`);
      }

      // Execute moves
      if (p1Decision) {
        const command = decisionToCommand(p1Decision);
        await this.engine.makeMove('p1', command);
      }
      if (p2Decision) {
        const command = decisionToCommand(p2Decision);
        await this.engine.makeMove('p2', command);
      }

      // Get logs
      const logs = this.engine.getLogs();
      logs.slice(-10).forEach((log) => this.onLog(log));

      await this.delay(500);
    }

    const winner = this.engine.getWinner();
    this.onLog(`\n=== Battle End ===`);
    this.onLog(`Winner: ${winner}`);

    return winner || 'draw';
  }

  private async getAIDecision(
    side: 'p1' | 'p2',
    state: BattleState
  ): Promise<AIDecision> {
    const request = this.engine.getRequest(side);
    const availableMoves = this.engine.getAvailableMoves(side);

    if (availableMoves === 0) {
      // Must switch or struggle
      return {
        reasoning: 'No available moves',
        action: 'move',
        index: 1,
      };
    }

    const prompt = buildAIPrompt(
      side,
      request,
      state,
      `Gen ${this.config.generation} ${this.config.battleFormat}`
    );

    try {
      const model = side === 'p1' ? this.config.p1Model : this.config.p2Model;
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      });

      const data = await response.json();
      return parseAIResponse(data.content, availableMoves);
    } catch (error) {
      console.error(`AI decision error for ${side}:`, error);
      // Fallback to random move
      return {
        reasoning: 'Error getting AI response, using random move',
        action: 'move',
        index: Math.floor(Math.random() * availableMoves) + 1,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
