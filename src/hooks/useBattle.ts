'use client';

import { useState, useCallback } from 'react';
import { BattleState, BattleRules, Party, AIAction } from '@/lib/types';
import { initializeBattle, executeTurn, checkBattleEnd } from '@/lib/battle';
import { getAIDecision, getInitialPokemonChoice } from '@/lib/groq';

export const useBattle = () => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [rules, setRules] = useState<BattleRules | null>(null);

  const startBattle = useCallback(async (
    player1Party: Party,
    player2Party: Party,
    player1Entry: number[],
    player2Entry: number[],
    battleRules: BattleRules
  ) => {
    setIsProcessing(true);
    setRules(battleRules);

    try {
      // 엔트리에서 선택된 포켓몬들
      const p1EntryPokemon = player1Entry.map(i => player1Party.pokemon[i]);
      const p2EntryPokemon = player2Entry.map(i => player2Party.pokemon[i]);

      // Get initial Pokémon choices from AI (엔트리 내에서)
      const [lead1, lead2] = await Promise.all([
        getInitialPokemonChoice(p1EntryPokemon, p2EntryPokemon, battleRules),
        getInitialPokemonChoice(p2EntryPokemon, p1EntryPokemon, battleRules)
      ]);

      const initialState = initializeBattle(
        player1Party.pokemon,
        player2Party.pokemon,
        player1Entry,
        player2Entry,
        lead1,
        lead2,
        battleRules
      );

      setBattleState(initialState);
      setWinner(null);
    } catch (error) {
      console.error('Failed to start battle:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processNextTurn = useCallback(async () => {
    if (!battleState || !rules || isProcessing) return;

    setIsProcessing(true);

    try {
      // Check if battle is already over
      const currentWinner = checkBattleEnd(battleState);
      if (currentWinner) {
        setWinner(currentWinner);
        setIsProcessing(false);
        return;
      }

      let action1: AIAction | null = null;
      let action2: AIAction | null = null;

      // Handle Player 1
      if (!battleState.player1.active) {
        // Player 1 needs to switch - get AI decision
        const availablePokemon = battleState.player1.entry
          .map((p, i) => ({ pokemon: p, index: i }))
          .filter(({ pokemon }) => !battleState.player1.fainted.includes(pokemon.id));
        
        if (availablePokemon.length > 0) {
          const switchIndex = await getAISwitchChoice(
            1,
            battleState,
            availablePokemon.map(p => p.index),
            rules
          );
          action1 = { type: 'switch', switchTo: switchIndex };
        }
      } else {
        // Normal turn - get AI decision for move or switch
        action1 = await getAIDecision({
          playerNumber: 1,
          myActivePokemon: battleState.player1.active,
          myParty: battleState.player1.entry, // 엔트리만 전달
          opponentActivePokemon: battleState.player2.active,
          opponentVisibleInfo: battleState.player2.active ? [battleState.player2.active] : [],
          battleState: {
            turn: battleState.turn,
            myFainted: battleState.player1.fainted,
            opponentFainted: battleState.player2.fainted,
            field: battleState.field
          },
          rules,
          recentLog: battleState.log.slice(-10),
          availableGimmicks: {
            canTerastallize: rules.allowTerastal && 
                              !battleState.player1.active.hasTerastallized && 
                              battleState.player1.gimmicksUsed < rules.gimmickUsageLimit,
            canDynamax: rules.allowDynamax && 
                        !battleState.player1.active.hasDynamaxed && 
                        battleState.player1.gimmicksUsed < rules.gimmickUsageLimit,
            canUseZMove: rules.allowZMoves && 
                         !battleState.player1.active.hasUsedZMove && 
                         battleState.player1.gimmicksUsed < rules.gimmickUsageLimit,
            canMegaEvolve: rules.allowMega && 
                           !battleState.player1.active.hasMegaEvolved && 
                           battleState.player1.gimmicksUsed < rules.gimmickUsageLimit
          }
        });
      }

      // Handle Player 2
      if (!battleState.player2.active) {
        const availablePokemon = battleState.player2.entry
          .map((p, i) => ({ pokemon: p, index: i }))
          .filter(({ pokemon }) => !battleState.player2.fainted.includes(pokemon.id));
        
        if (availablePokemon.length > 0) {
          const switchIndex = await getAISwitchChoice(
            2,
            battleState,
            availablePokemon.map(p => p.index),
            rules
          );
          action2 = { type: 'switch', switchTo: switchIndex };
        }
      } else {
        action2 = await getAIDecision({
          playerNumber: 2,
          myActivePokemon: battleState.player2.active,
          myParty: battleState.player2.entry, // 엔트리만 전달
          opponentActivePokemon: battleState.player1.active,
          opponentVisibleInfo: battleState.player1.active ? [battleState.player1.active] : [],
          battleState: {
            turn: battleState.turn,
            myFainted: battleState.player2.fainted,
            opponentFainted: battleState.player1.fainted,
            field: battleState.field
          },
          rules,
          recentLog: battleState.log.slice(-10),
          availableGimmicks: {
            canTerastallize: rules.allowTerastal && 
                              !battleState.player2.active.hasTerastallized && 
                              battleState.player2.gimmicksUsed < rules.gimmickUsageLimit,
            canDynamax: rules.allowDynamax && 
                        !battleState.player2.active.hasDynamaxed && 
                        battleState.player2.gimmicksUsed < rules.gimmickUsageLimit,
            canUseZMove: rules.allowZMoves && 
                         !battleState.player2.active.hasUsedZMove && 
                         battleState.player2.gimmicksUsed < rules.gimmickUsageLimit,
            canMegaEvolve: rules.allowMega && 
                           !battleState.player2.active.hasMegaEvolved && 
                           battleState.player2.gimmicksUsed < rules.gimmickUsageLimit
          }
        });
      }

      if (action1 && action2) {
        const newState = executeTurn(battleState, action1, action2, rules);
        setBattleState(newState);

        // Check for battle end
        const battleWinner = checkBattleEnd(newState);
        if (battleWinner) {
          setWinner(battleWinner);
        }
      }
    } catch (error) {
      console.error('Failed to process turn:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [battleState, rules, isProcessing]);

  return {
    battleState,
    isProcessing,
    winner,
    startBattle,
    processNextTurn
  };
};

// Helper function to get AI switch choice when Pokemon faints
const getAISwitchChoice = async (
  playerNumber: 1 | 2,
  battleState: BattleState,
  availableIndices: number[],
  rules: BattleRules
): Promise<number> => {
  const player = playerNumber === 1 ? battleState.player1 : battleState.player2;
  const opponent = playerNumber === 1 ? battleState.player2 : battleState.player1;

  try {
    const prompt = `
Your Pokémon has fainted! You must choose which Pokémon to send out next.

AVAILABLE POKÉMON (choose by index):
${availableIndices.map(i => `${i}. ${player.entry[i].species} Lv.${player.entry[i].level} (${player.entry[i].ability}) - HP: ${player.entry[i].currentHP?.toFixed(1)}%`).join('\n')}

OPPONENT'S ACTIVE POKÉMON:
${opponent.active ? `${opponent.active.species} (${opponent.active.ability}) - HP: ${opponent.active.currentHP?.toFixed(1)}%` : 'None'}

YOUR FAINTED: ${player.fainted.length}
OPPONENT FAINTED: ${opponent.fainted.length}

Choose the best Pokémon to send out (respond with index only).
Respond in JSON: {"index": number, "reasoning": "brief explanation"}
`;

    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are choosing which Pokémon to switch in after a faint.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const chosenIndex = response.index;

    if (availableIndices.includes(chosenIndex)) {
      return chosenIndex;
    }
  } catch (error) {
    console.error('AI switch choice error:', error);
  }

  return availableIndices[0];
};
