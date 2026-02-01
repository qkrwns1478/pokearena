import { AIDecision, BattleState, PokemonState } from './types';

export function buildAIPrompt(
  side: 'p1' | 'p2',
  request: any,
  battleState: BattleState,
  format: string
): string {
  const myPokemon = side === 'p1' ? battleState.activePokemon.p1 : battleState.activePokemon.p2;
  const oppPokemon = side === 'p1' ? battleState.activePokemon.p2 : battleState.activePokemon.p1;

  const availableMoves = myPokemon?.moves
    .filter((m) => !m.disabled && m.pp > 0)
    .map((m, idx) => ({
      index: idx + 1,
      name: m.name,
      type: m.type,
      category: m.category,
      power: m.basePower,
      accuracy: m.accuracy,
      pp: m.pp,
    })) || [];

  const prompt = `You are competing in ${format}.

YOUR POKEMON:
Species: ${myPokemon?.species}
HP: ${myPokemon?.hp}/${myPokemon?.maxHp} (${myPokemon ? Math.round((myPokemon.hp / myPokemon.maxHp) * 100) : 0}%)
Status: ${myPokemon?.status || 'Healthy'}
Ability: ${myPokemon?.ability}

OPPONENT:
Species: ${oppPokemon?.species}
HP: ${oppPokemon?.hp}/${oppPokemon?.maxHp} (${oppPokemon ? Math.round((oppPokemon.hp / oppPokemon.maxHp) * 100) : 0}%)
Status: ${oppPokemon?.status || 'Healthy'}

YOUR MOVES:
${availableMoves.map((m) => `${m.index}. ${m.name} (${m.type}, Power: ${m.power})`).join('\n')}

Choose the best strategic move considering type effectiveness.
Return JSON: {"reasoning": "brief explanation", "action": "move", "index": <1-${availableMoves.length}>}`;

  return prompt;
}

export function decisionToCommand(decision: AIDecision): string {
  let command = `${decision.action} ${decision.index}`;
  
  if (decision.mega) command += ' mega';
  if (decision.zmove) command += ' zmove';
  if (decision.dynamax) command += ' dynamax';
  if (decision.tera) command += ' terastallize';

  return command;
}
