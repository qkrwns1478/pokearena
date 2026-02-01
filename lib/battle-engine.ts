import { Battle, Pokemon } from '@pkmn/sim';
import { Dex } from '@pkmn/dex';
import { BattleState, PokemonState, FieldState, MoveInfo, AIDecision, IBattleConfig } from './types';
import { buildAIPrompt, decisionToCommand } from './ai-agent';

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
    });

    this.battle.setPlayer('p1', {
      name: 'Player 1',
      team: p1Team,
    });
    
    this.battle.setPlayer('p2', {
      name: 'Player 2',
      team: p2Team,
    });
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

  getRequestJSON(side: 'p1' | 'p2'): any {
    const player = side === 'p1' ? this.battle.p1 : this.battle.p2;
    return (player as any).request;
  }

  // Force update request
  updateRequest(side: 'p1' | 'p2'): void {
    const player = side === 'p1' ? this.battle.p1 : this.battle.p2;
    
    // Check if any active pokemon fainted
    const activeFainted = player.active.some(p => p && p.fainted);
    
    if (activeFainted) {
      // Need to switch - check available pokemon
      const availableSwitches: number[] = [];
      player.pokemon.forEach((p, i) => {
        if (!p.fainted && !p.isActive) {
          availableSwitches.push(i);
        }
      });
      
      if (availableSwitches.length > 0) {
        // Force switch request
        const request: any = {
          requestType: 'switch',
          forceSwitch: [true],
          side: {
            name: player.name,
            id: player.id,
            pokemon: player.pokemon.map((p, i) => ({
              ident: `${player.id}: ${p.name}`,
              details: `${p.species.name}${p.level !== 100 ? `, L${p.level}` : ''}${p.gender ? `, ${p.gender}` : ''}`,
              condition: p.fainted ? '0 fnt' : `${p.hp}/${p.maxhp}${p.status ? ` ${p.status}` : ''}`,
              active: p.isActive,
              stats: p.storedStats,
              moves: p.moveSlots.map(m => m.move),
              baseAbility: p.baseAbility,
              item: p.item,
              pokeball: p.pokeball,
              ability: p.ability,
            })),
          },
        };
        
        (player as any).request = request;
        console.log(`Force switch request for ${side}`, request);
        return;
      } else {
        // No pokemon left - battle should end
        console.log(`No pokemon left for ${side}`);
        return;
      }
    }
    
    // Manually trigger request update by accessing the active pokemon
    if (player.active && player.active.length > 0 && player.active[0] && !player.active[0].fainted) {
      const activeMon = player.active[0];
      
      // Build request manually
      const request: any = {
        requestType: 'move',
        active: [{
          moves: activeMon.moveSlots.map((slot, i) => ({
            move: slot.move,
            id: slot.id,
            pp: slot.pp,
            maxpp: slot.maxpp,
            target: slot.target,
            disabled: slot.disabled || false,
          })),
        }],
        side: {
          name: player.name,
          id: player.id,
          pokemon: player.pokemon.map((p, i) => ({
            ident: `${player.id}: ${p.name}`,
            details: `${p.species.name}${p.level !== 100 ? `, L${p.level}` : ''}${p.gender ? `, ${p.gender}` : ''}`,
            condition: p.fainted ? '0 fnt' : `${p.hp}/${p.maxhp}${p.status ? ` ${p.status}` : ''}`,
            active: p === activeMon,
            stats: p.storedStats,
            moves: p.moveSlots.map(m => m.move),
            baseAbility: p.baseAbility,
            item: p.item,
            pokeball: p.pokeball,
            ability: p.ability,
          })),
        },
      };
      
      (player as any).request = request;
      console.log(`Move request for ${side}`, request);
    }
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

  makeChoice(side: 'p1' | 'p2', choice: string): boolean {
    try {
      this.battle.choose(side, choice);
      return true;
    } catch (error) {
      console.error(`Error making choice for ${side}:`, error);
      return false;
    }
  }

  getLogs(): string[] {
    return this.battle.log;
  }

  hasTurnStarted(): boolean {
    const logs = this.battle.log;
    return logs.some(log => log.includes('|turn|'));
  }
}

export class BattleOrchestrator {
  private engine: BattleEngineWrapper;
  private config: IBattleConfig;
  private onLog: (log: string) => void;
  private onStateUpdate: (state: BattleState) => void;
  private onAIReasoning: (turn: number, side: 'p1' | 'p2', reason: string) => void;
  public shouldStop: boolean = false;
  private lastLogLength: number = 0;

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

  private logNewMessages(): void {
    const logs = this.engine.getLogs();
    const newLogs = logs.slice(this.lastLogLength);
    newLogs.forEach(log => {
      if (log && log.trim()) {
        this.onLog(log);
      }
    });
    this.lastLogLength = logs.length;
  }

  async runBattle(): Promise<'p1' | 'p2' | 'draw'> {
    // Initial logs
    this.logNewMessages();

    // Check for team preview in logs
    const allLogs = this.engine.getLogs().join('\n');
    const hasTeamPreview = allLogs.includes('|teampreview');

    if (hasTeamPreview) {
      this.onLog('\n=== Team Preview ===');
      
      this.onLog('[P1] Selecting team order...');
      this.engine.makeChoice('p1', 'default');
      
      this.onLog('[P2] Selecting team order...');
      this.engine.makeChoice('p2', 'default');
      
      await this.delay(1000);
      this.logNewMessages();
    }

    // Wait for battle to actually start
    let startWait = 0;
    while (!this.engine.hasTurnStarted() && startWait < 10) {
      await this.delay(200);
      startWait++;
    }

    if (!this.engine.hasTurnStarted()) {
      this.onLog('ERROR: Battle did not start');
      return 'draw';
    }

    this.onLog('\n=== Battle Started ===');

    let turnCount = 0;
    const maxTurns = 100;

    while (!this.engine.isGameOver() && turnCount < maxTurns && !this.shouldStop) {
      if (this.shouldStop) {
        this.onLog('\n=== Battle Stopped ===');
        break;
      }

      // Manually update requests
      this.engine.updateRequest('p1');
      this.engine.updateRequest('p2');

      // Get request states
      const p1Request = this.engine.getRequestJSON('p1');
      const p2Request = this.engine.getRequestJSON('p2');
      
      const p1NeedsChoice = (p1Request?.active && p1Request.active[0]) || p1Request?.forceSwitch;
      const p2NeedsChoice = (p2Request?.active && p2Request.active[0]) || p2Request?.forceSwitch;

      console.log('Turn', turnCount + 1, 'P1 needs:', p1Request?.requestType, 'P2 needs:', p2Request?.requestType);

      if (!p1NeedsChoice && !p2NeedsChoice) {
        this.onLog(`Waiting for requests...`);
        await this.delay(200);
        continue;
      }

      turnCount++;
      this.onLog(`\n=== Turn ${turnCount} ===`);

      // Get current state
      const state = this.engine.getCurrentState();
      this.onStateUpdate(state);

      // Get choices (even if only one side needs it)
      const p1Choice = p1NeedsChoice ? await this.getPlayerChoice('p1', p1Request, state, turnCount) : null;
      const p2Choice = p2NeedsChoice ? await this.getPlayerChoice('p2', p2Request, state, turnCount) : null;

      // Submit choices
      if (p1Choice) {
        this.engine.makeChoice('p1', p1Choice);
      }
      if (p2Choice) {
        this.engine.makeChoice('p2', p2Choice);
      }

      // Wait for battle to process
      await this.delay(500);

      // Log new messages
      this.logNewMessages();

      // Update state
      const updatedState = this.engine.getCurrentState();
      this.onStateUpdate(updatedState);

      await this.delay(200);
    }

    const winner = this.engine.getWinner();
    this.onLog(`\n=== Battle End ===`);
    this.onLog(`Winner: ${winner || 'Draw'}`);

    return winner || 'draw';
  }

  private async getPlayerChoice(
    side: 'p1' | 'p2',
    request: any,
    state: BattleState,
    turn: number
  ): Promise<string | null> {
    // Handle forced switch
    if (request?.forceSwitch) {
      const pokemon = request.side?.pokemon || [];
      
      // Find first available non-fainted, non-active pokemon
      for (let i = 0; i < pokemon.length; i++) {
        const poke = pokemon[i];
        const isFainted = poke.condition.includes('fnt') || poke.condition.startsWith('0 ');
        
        if (!poke.active && !isFainted) {
          this.onLog(`[${side.toUpperCase()}] Switching to ${poke.ident.split(': ')[1]} (slot ${i + 1})`);
          return `switch ${i + 1}`;
        }
      }
      
      this.onLog(`[${side.toUpperCase()}] ERROR: No pokemon available to switch`);
      return 'pass';
    }

    // Handle active moves
    if (request?.active && request.active[0]) {
      const activeData = request.active[0];
      const moves = activeData.moves || [];
      const validMoves = moves.filter((m: any) => !m.disabled && m.pp > 0);

      if (validMoves.length === 0) {
        return 'move 1'; // Struggle
      }

      // Get AI decision
      const decision = await this.getAIDecision(side, request, state, validMoves.length);
      
      this.onAIReasoning(turn, side, decision.reasoning);
      this.onLog(`[${side.toUpperCase()}] ${decision.reasoning}`);

      const command = decisionToCommand(decision);
      this.onLog(`[${side.toUpperCase()}] Chooses: ${command}`);
      
      return command;
    }

    return null;
  }

  private async getAIDecision(
    side: 'p1' | 'p2',
    request: any,
    state: BattleState,
    maxMoves: number
  ): Promise<AIDecision> {
    const prompt = buildAIPrompt(side, request, state, `Gen ${this.config.generation} ${this.config.battleFormat}`);

    try {
      const model = side === 'p1' ? this.config.p1Model : this.config.p2Model;
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, maxMoves }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.decision;
    } catch (error) {
      console.error(`AI decision error for ${side}:`, error);
      const randomIndex = Math.floor(Math.random() * maxMoves) + 1;
      return {
        reasoning: 'AI error, using random move',
        action: 'move',
        index: randomIndex,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
