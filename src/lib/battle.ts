import { Generations, Pokemon, Move, calculate } from '@smogon/calc';
import { BattleState, PokemonData, AIAction, BattleLogEntry, BattleRules } from './types';

export const initializeBattle = (
  player1Party: PokemonData[],
  player2Party: PokemonData[],
  player1Entry: number[], // 선발된 포켓몬 인덱스
  player2Entry: number[],
  player1Lead: number,
  player2Lead: number,
  rules: BattleRules
): BattleState => {
  // Apply level cap and initialize HP for all Pokemon
  const applyLevelCap = (pokemon: PokemonData): PokemonData => ({
    ...pokemon,
    level: Math.min(pokemon.level, rules.levelCap),
    currentHP: 100,
    hasTerastallized: false,
    hasDynamaxed: false,
    hasUsedZMove: false,
    hasMegaEvolved: false
  });

  const player1Adjusted = player1Party.map(applyLevelCap);
  const player2Adjusted = player2Party.map(applyLevelCap);

  // 엔트리 선발
  const player1EntryPokemon = player1Entry.map(i => player1Adjusted[i]);
  const player2EntryPokemon = player2Entry.map(i => player2Adjusted[i]);

  return {
    turn: 1,
    player1: {
      party: player1Adjusted,
      entry: player1EntryPokemon,
      active: { ...player1EntryPokemon[player1Lead] },
      fainted: [],
      gimmicksUsed: 0
    },
    player2: {
      party: player2Adjusted,
      entry: player2EntryPokemon,
      active: { ...player2EntryPokemon[player2Lead] },
      fainted: [],
      gimmicksUsed: 0
    },
    field: {},
    log: [
      {
        turn: 0,
        timestamp: new Date(),
        type: 'info',
        player: 1,
        message: `Player 1 sent out ${player1EntryPokemon[player1Lead].species} (Lv.${player1EntryPokemon[player1Lead].level})!`
      },
      {
        turn: 0,
        timestamp: new Date(),
        type: 'info',
        player: 2,
        message: `Player 2 sent out ${player2EntryPokemon[player2Lead].species} (Lv.${player2EntryPokemon[player2Lead].level})!`
      }
    ]
  };
};

export const executeTurn = (
  state: BattleState,
  action1: AIAction,
  action2: AIAction,
  rules: BattleRules
): BattleState => {
  // Deep copy the state
  const newState: BattleState = {
    ...state,
    player1: {
      ...state.player1,
      party: state.player1.party.map(p => ({ ...p })),
      entry: state.player1.entry.map(p => ({ ...p })),
      active: state.player1.active ? { ...state.player1.active } : null,
      fainted: [...state.player1.fainted],
      gimmicksUsed: state.player1.gimmicksUsed
    },
    player2: {
      ...state.player2,
      party: state.player2.party.map(p => ({ ...p })),
      entry: state.player2.entry.map(p => ({ ...p })),
      active: state.player2.active ? { ...state.player2.active } : null,
      fainted: [...state.player2.fainted],
      gimmicksUsed: state.player2.gimmicksUsed
    },
    log: [...state.log]
  };

  const gen = Generations.get(rules.generation);
  const order = determineActionOrder(newState, action1, action2);

  for (const playerNum of order) {
    const action = playerNum === 1 ? action1 : action2;
    const attacker = playerNum === 1 ? newState.player1 : newState.player2;
    const defender = playerNum === 1 ? newState.player2 : newState.player1;

    // Handle gimmick usage
    const gimmickUsed = action.useTerastal || action.useDynamax || action.useZMove || action.useMega;
    if (gimmickUsed && attacker.active) {
      attacker.gimmicksUsed += 1;
      
      if (action.useTerastal && attacker.active.teraType) {
        attacker.active.hasTerastallized = true;
        syncPokemonState(attacker, attacker.active);
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'info',
          player: playerNum as 1 | 2,
          message: `${attacker.active.species} Terastallized into ${attacker.active.teraType}-type!`
        });
      }
      
      if (action.useDynamax) {
        attacker.active.hasDynamaxed = true;
        syncPokemonState(attacker, attacker.active);
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'info',
          player: playerNum as 1 | 2,
          message: `${attacker.active.species} Dynamaxed!`
        });
      }
      
      if (action.useZMove) {
        attacker.active.hasUsedZMove = true;
        syncPokemonState(attacker, attacker.active);
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'info',
          player: playerNum as 1 | 2,
          message: `${attacker.active.species} used a Z-Move!`
        });
      }
      
      if (action.useMega) {
        attacker.active.hasMegaEvolved = true;
        syncPokemonState(attacker, attacker.active);
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'info',
          player: playerNum as 1 | 2,
          message: `${attacker.active.species} Mega Evolved!`
        });
      }
    }

    if (action.type === 'switch' && action.switchTo !== undefined) {
      if (attacker.active) {
        syncPokemonState(attacker, attacker.active);
      }

      // 엔트리에서만 교체 가능
      const newPokemon = attacker.entry[action.switchTo];
      if (!attacker.fainted.includes(newPokemon.id)) {
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'switch',
          player: playerNum as 1 | 2,
          message: `Player ${playerNum} switched to ${newPokemon.species}! (HP: ${newPokemon.currentHP?.toFixed(1)}%)`
        });
        attacker.active = { ...newPokemon };
        console.log(`Player ${playerNum} switched to ${newPokemon.species} with HP=${newPokemon.currentHP}%`);
      }
    } else if (action.type === 'move' && action.moveIndex !== undefined && attacker.active && defender.active) {
      const moveName = attacker.active.moves[action.moveIndex];
      
      newState.log.push({
        turn: state.turn,
        timestamp: new Date(),
        type: 'move',
        player: playerNum as 1 | 2,
        message: `${attacker.active.species} used ${moveName}!`
      });

      const damage = calculateDamage(
        attacker.active,
        defender.active,
        moveName,
        gen,
        rules
      );

      if (damage > 0) {
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'damage',
          player: playerNum as 1 | 2,
          message: `It dealt ${damage.toFixed(1)}% damage!`,
          details: { damage }
        });

        const defenderHP = defender.active.currentHP || 100;
        const newHP = Math.max(0, defenderHP - damage);
        defender.active.currentHP = newHP;
        syncPokemonState(defender, defender.active);

        if (newHP <= 0) {
          const faintedSpecies = defender.active.species;
          
          newState.log.push({
            turn: state.turn,
            timestamp: new Date(),
            type: 'faint',
            player: (playerNum === 1 ? 2 : 1) as 1 | 2,
            message: `${faintedSpecies} fainted!`
          });
          defender.fainted.push(defender.active.id);
          defender.active = null;
        }
      }
    }
  }

  // Save active states
  if (newState.player1.active) {
    syncPokemonState(newState.player1, newState.player1.active);
  }
  
  if (newState.player2.active) {
    syncPokemonState(newState.player2, newState.player2.active);
  }

  newState.turn += 1;
  return newState;
};

// 포켓몬 상태 동기화 헬퍼
const syncPokemonState = (player: BattleState['player1'] | BattleState['player2'], pokemon: PokemonData) => {
  // entry에서 업데이트
  const entryIndex = player.entry.findIndex(p => p.id === pokemon.id);
  if (entryIndex !== -1) {
    player.entry[entryIndex] = { ...pokemon };
  }
  
  // party에서도 업데이트
  const partyIndex = player.party.findIndex(p => p.id === pokemon.id);
  if (partyIndex !== -1) {
    player.party[partyIndex] = { ...pokemon };
  }
};

const determineActionOrder = (
  state: BattleState,
  action1: AIAction,
  action2: AIAction
): (1 | 2)[] => {
  if (action1.type === 'switch' && action2.type !== 'switch') return [1, 2];
  if (action2.type === 'switch' && action1.type !== 'switch') return [2, 1];

  const speed1 = state.player1.active?.evs.spe || 0;
  const speed2 = state.player2.active?.evs.spe || 0;

  return speed1 >= speed2 ? [1, 2] : [2, 1];
};

const calculateDamage = (
  attacker: PokemonData,
  defender: PokemonData,
  moveName: string,
  gen: ReturnType<typeof Generations.get>,
  rules: BattleRules
): number => {
  try {
    const attackerPokemon = new Pokemon(gen, attacker.species, {
      level: attacker.level,
      ability: attacker.ability,
      item: attacker.item,
      nature: attacker.nature,
      evs: attacker.evs,
      ivs: attacker.ivs
    });

    const defenderPokemon = new Pokemon(gen, defender.species, {
      level: defender.level,
      ability: defender.ability,
      item: defender.item,
      nature: defender.nature,
      evs: defender.evs,
      ivs: defender.ivs
    });

    const move = new Move(gen, moveName);
    const result = calculate(gen, attackerPokemon, defenderPokemon, move);

    const damageArray = result.damage as number[];
    if (Array.isArray(damageArray)) {
      return damageArray.reduce((a, b) => a + b, 0) / damageArray.length;
    }
    return typeof result.damage === 'number' ? result.damage : 0;
  } catch (error) {
    console.error('Damage calculation error:', error);
    return 0;
  }
};

export const checkBattleEnd = (state: BattleState): 1 | 2 | null => {
  // 엔트리 기준으로 체크
  const player1Alive = state.player1.entry.filter(
    p => !state.player1.fainted.includes(p.id)
  ).length;
  const player2Alive = state.player2.entry.filter(
    p => !state.player2.fainted.includes(p.id)
  ).length;

  console.log(`Battle check - P1 alive: ${player1Alive}, P2 alive: ${player2Alive}`);

  if (player1Alive === 0) return 2;
  if (player2Alive === 0) return 1;
  return null;
};

// 포맷에 따른 엔트리 수 반환
export const getEntryCount = (format: string): number => {
  switch (format) {
    case '1v1': return 1;
    case '3v3': return 3;
    case '6v6': return 6;
    default: return 6;
  }
};
