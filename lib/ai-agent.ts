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
      power: m.basePower,
      accuracy: m.accuracy,
      pp: m.pp,
    })) || [];

  const prompt = `You are a competitive Pokemon battle AI.
Your Goal: Win the battle.
Format: ${format}
Your Role: You are controlling Player ${side.toUpperCase()}.

Current Situation:
Turn: ${battleState.turn}
Weather: ${battleState.field.weather || 'None'}
Terrain: ${battleState.field.terrain || 'None'}

Your Active Pokemon:
- Name: ${myPokemon?.name}
- HP: ${myPokemon?.hp}/${myPokemon?.maxHp} (${myPokemon ? Math.round((myPokemon.hp / myPokemon.maxHp) * 100) : 0}%)
- Status: ${myPokemon?.status || 'None'}
- Ability: ${myPokemon?.ability}
- Item: ${myPokemon?.item || 'None'}

Opponent's Active Pokemon:
- Name: ${oppPokemon?.name}
- HP: ${oppPokemon?.hp}/${oppPokemon?.maxHp} (${oppPokemon ? Math.round((oppPokemon.hp / oppPokemon.maxHp) * 100) : 0}%)
- Status: ${oppPokemon?.status || 'None'}

Your Available Moves:
${availableMoves.map((m) => `${m.index}. ${m.name} (Type: ${m.type}, Power: ${m.power}, Accuracy: ${m.accuracy}%, PP: ${m.pp})`).join('\n')}

Task:
Analyze the match-up and return the best move in JSON format.
{
  "reasoning": "Short explanation (max 1 sentence).",
  "action": "move",
  "index": number (1-${availableMoves.length})
}

IMPORTANT: Only return valid JSON. Index must be between 1 and ${availableMoves.length}.`;

  return prompt;
}

export function parseAIResponse(response: string, maxMoves: number): AIDecision {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const decision: AIDecision = JSON.parse(jsonMatch[0]);

    // Validation
    if (!decision.action || !decision.index) {
      throw new Error('Missing required fields');
    }

    if (decision.action === 'move' && (decision.index < 1 || decision.index > maxMoves)) {
      throw new Error('Invalid move index');
    }

    return decision;
  } catch (error) {
    // Fallback: random move
    console.error('AI response parsing failed:', error);
    return {
      reasoning: 'Failed to parse AI response, using random move',
      action: 'move',
      index: Math.floor(Math.random() * maxMoves) + 1,
    };
  }
}

export function decisionToCommand(decision: AIDecision): string {
  let command = `${decision.action} ${decision.index}`;
  
  if (decision.mega) command += ' mega';
  if (decision.zmove) command += ' zmove';
  if (decision.dynamax) command += ' dynamax';
  if (decision.tera) command += ' terastallize';

  return command;
}
