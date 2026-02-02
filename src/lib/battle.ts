import { Generations, Pokemon, Move, calculate } from '@smogon/calc';
import { BattleState, PokemonData, AIAction, BattleLogEntry, BattleRules } from './types';

export const initializeBattle = (
  player1Party: PokemonData[],
  player2Party: PokemonData[],
  player1Lead: number,
  player2Lead: number,
  rules: BattleRules
): BattleState => {
  // Initialize HP for all Pokemon
  const initParty = (party: PokemonData[]) => 
    party.map(p => ({ ...p, currentHP: 100 } as any));

  return {
    turn: 1,
    player1: {
      party: initParty(player1Party),
      active: { ...player1Party[player1Lead], currentHP: 100 } as any,
      fainted: []
    },
    player2: {
      party: initParty(player2Party),
      active: { ...player2Party[player2Lead], currentHP: 100 } as any,
      fainted: []
    },
    field: {},
    log: [
      {
        turn: 0,
        timestamp: new Date(),
        type: 'info',
        player: 1,
        message: `Player 1 sent out ${player1Party[player1Lead].species}!`
      },
      {
        turn: 0,
        timestamp: new Date(),
        type: 'info',
        player: 2,
        message: `Player 2 sent out ${player2Party[player2Lead].species}!`
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
      party: [...state.player1.party],
      active: state.player1.active ? { ...state.player1.active } : null,
      fainted: [...state.player1.fainted]
    },
    player2: {
      ...state.player2,
      party: [...state.player2.party],
      active: state.player2.active ? { ...state.player2.active } : null,
      fainted: [...state.player2.fainted]
    },
    log: [...state.log]
  };

  const gen = Generations.get(rules.generation);

  // Determine action order based on priority and speed
  const order = determineActionOrder(newState, action1, action2);

  for (const playerNum of order) {
    const action = playerNum === 1 ? action1 : action2;
    const attacker = playerNum === 1 ? newState.player1 : newState.player2;
    const defender = playerNum === 1 ? newState.player2 : newState.player1;

    if (action.type === 'switch' && action.switchTo !== undefined) {
      const newPokemon = attacker.party[action.switchTo];
      if (!attacker.fainted.includes(newPokemon.id)) {
        newState.log.push({
          turn: state.turn,
          timestamp: new Date(),
          type: 'switch',
          player: playerNum as 1 | 2,
          message: `Player ${playerNum} switched to ${newPokemon.species}!`
        });
        attacker.active = { ...newPokemon };
        console.log(`Player ${playerNum} switched to ${newPokemon.species}`);
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

      console.log(`Player ${playerNum}'s ${attacker.active.species} used ${moveName}`);

      // Calculate damage using @smogon/calc
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

        const defenderHP = (defender.active as any).currentHP || 100;
        const newHP = Math.max(0, defenderHP - damage);
        (defender.active as any).currentHP = newHP;

        console.log(`Damage: ${damage.toFixed(1)}%, New HP: ${newHP.toFixed(1)}%`);

        if (newHP <= 0) {
          const faintedSpecies = defender.active.species; // Save species before setting to null
          
          newState.log.push({
            turn: state.turn,
            timestamp: new Date(),
            type: 'faint',
            player: (playerNum === 1 ? 2 : 1) as 1 | 2,
            message: `${faintedSpecies} fainted!`
          });
          defender.fainted.push(defender.active.id);
          console.log(`Player ${playerNum === 1 ? 2 : 1}'s ${faintedSpecies} fainted!`);
          defender.active = null;
        }
      }
    }
  }

  newState.turn += 1;
  console.log(`Turn ${newState.turn} completed. P1 active: ${newState.player1.active?.species}, P2 active: ${newState.player2.active?.species}`);
  
  return newState;
};

const determineActionOrder = (
  state: BattleState,
  action1: AIAction,
  action2: AIAction
): (1 | 2)[] => {
  // Switches always go first
  if (action1.type === 'switch' && action2.type !== 'switch') return [1, 2];
  if (action2.type === 'switch' && action1.type !== 'switch') return [2, 1];

  // Compare speeds (simplified)
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

    // Return average damage percentage
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
  const player1Alive = state.player1.party.filter(
    p => !state.player1.fainted.includes(p.id)
  ).length;
  const player2Alive = state.player2.party.filter(
    p => !state.player2.fainted.includes(p.id)
  ).length;

  console.log(`Battle check - P1 alive: ${player1Alive}, P2 alive: ${player2Alive}`);

  if (player1Alive === 0) return 2;
  if (player2Alive === 0) return 1;
  return null;
};
