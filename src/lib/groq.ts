import Groq from 'groq-sdk';
import { AIRequest, AIAction, PokemonData, BattleRules } from './types';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getAIDecision = async (request: AIRequest): Promise<AIAction> => {
  const prompt = buildPrompt(request);
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a competitive Pokémon battle AI. Analyze the battle state and make optimal decisions. 
          You must respond in JSON format with the following structure:
          {
            "type": "move" or "switch",
            "moveIndex": 0-3 (if type is "move"),
            "switchTo": 0-5 (if type is "switch", index of party member),
            "useTerastal": true/false (optional, use Terastallization),
            "useDynamax": true/false (optional, use Dynamax),
            "useZMove": true/false (optional, use Z-Move),
            "useMega": true/false (optional, use Mega Evolution),
            "reasoning": "brief explanation of your decision"
          }
          
          Consider using special mechanics (Tera, Dynamax, Z-Move, Mega) at key moments for maximum impact.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const action: AIAction = JSON.parse(response);
    return action;
  } catch (error) {
    console.error('AI decision error:', error);
    // Fallback: random move
    return {
      type: 'move',
      moveIndex: Math.floor(Math.random() * request.myActivePokemon.moves.length),
      reasoning: 'Error occurred, using random move'
    };
  }
};

const buildPrompt = (request: AIRequest): string => {
  const {
    myActivePokemon,
    myParty,
    opponentActivePokemon,
    battleState,
    rules,
    recentLog,
    availableGimmicks
  } = request;

  const gimmicksStatus = [
    availableGimmicks.canTerastallize && `Terastallize to ${myActivePokemon.teraType}-type`,
    availableGimmicks.canDynamax && `Dynamax (3 turns of power)`,
    availableGimmicks.canUseZMove && `Z-Move (one-time powerful attack)`,
    availableGimmicks.canMegaEvolve && `Mega Evolution (permanent stat boost)`
  ].filter(Boolean).join(', ');

  const hasGimmicksAvailable = Object.values(availableGimmicks).some(v => v);

  return `
BATTLE STATE (Turn ${battleState.turn})
-----------------------------------------

YOUR ACTIVE POKÉMON:
${formatPokemon(myActivePokemon)} [HP: ${myActivePokemon.currentHP?.toFixed(1) || 100}%]
${myActivePokemon.hasTerastallized ? `[TERASTALLIZED: ${myActivePokemon.teraType}-type]` : ''}
${myActivePokemon.hasDynamaxed ? '[DYNAMAXED]' : ''}
${myActivePokemon.hasMegaEvolved ? '[MEGA EVOLVED]' : ''}

OPPONENT'S ACTIVE POKÉMON:
${opponentActivePokemon ? `${formatPokemon(opponentActivePokemon)} [HP: ${opponentActivePokemon.currentHP?.toFixed(1) || 100}%]` : 'Unknown'}
${opponentActivePokemon?.hasTerastallized ? `[TERASTALLIZED: ${opponentActivePokemon.teraType}-type]` : ''}

YOUR AVAILABLE PARTY:
${myParty.map((p, i) => `${i}. ${formatPokemon(p)} [HP: ${(p.currentHP || 100).toFixed(1)}%]`).join('\n')}

YOUR FAINTED: ${battleState.myFainted.join(', ') || 'None'}
OPPONENT FAINTED: ${battleState.opponentFainted.join(', ') || 'None'}

AVAILABLE SPECIAL MECHANICS:
${hasGimmicksAvailable ? gimmicksStatus : 'No gimmicks available (limit reached or none enabled)'}

GIMMICK USAGE:
- Total gimmick limit per player: ${rules.gimmickUsageLimit}
- You have used: Check your battle state
- You can only use ONE gimmick per turn if available

RECENT BATTLE LOG:
${recentLog.slice(-5).map(l => `Turn ${l.turn}: ${l.message}`).join('\n')}

RULES:
- Generation: ${rules.generation}
- Format: ${rules.format} ${rules.battleType}
- Terastal: ${rules.allowTerastal ? 'Yes' : 'No'}
- Dynamax: ${rules.allowDynamax ? 'Yes' : 'No'}

DECISION REQUIRED:
Analyze the situation and decide whether to use a move or switch Pokémon.
Consider type matchups, HP, stats, and strategic positioning.
${hasGimmicksAvailable ? 'You can activate ONE special mechanic this turn if strategically beneficial. Use them wisely as you have limited uses!' : ''}
`;
};

const formatPokemon = (pokemon: Partial<PokemonData>): string => {
  return `${pokemon.species} Lv.${pokemon.level || 100} (${pokemon.ability}) - Moves: ${pokemon.moves?.join(', ')}`;
};

export const getInitialPokemonChoice = async (
  myParty: PokemonData[],
  opponentParty: PokemonData[],
  rules: BattleRules
): Promise<number> => {
  const prompt = `
You are selecting the first Pokémon to send out in a battle.

YOUR PARTY:
${myParty.map((p, i) => `${i}. ${formatPokemon(p)}`).join('\n')}

OPPONENT'S PARTY:
${opponentParty.map((p, i) => `${i}. ${formatPokemon(p)}`).join('\n')}

RULES: ${rules.format} ${rules.battleType}, Generation ${rules.generation}

Analyze team matchups and select the best lead Pokémon (0-${myParty.length - 1}).
Respond in JSON: {"index": number, "reasoning": "explanation"}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a competitive Pokémon battle AI selecting your lead Pokémon.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return response.index ?? 0;
  } catch (error) {
    console.error('Initial choice error:', error);
    return 0;
  }
};
