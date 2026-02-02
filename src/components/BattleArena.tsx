'use client';

import { useBattle } from '@/hooks/useBattle';
import { BattleRules, Party } from '@/lib/types';
import { useState } from 'react';

interface Props {
  player1Party: Party;
  player2Party: Party;
  rules: BattleRules;
}

export default function BattleArena({ player1Party, player2Party, rules }: Props) {
  const { battleState, isProcessing, winner, startBattle, processNextTurn } = useBattle();
  const [started, setStarted] = useState(false);

  const handleStart = async () => {
    await startBattle(player1Party, player2Party, rules);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="flex items-center justify-center h-64">
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700"
        >
          배틀 시작!
        </button>
      </div>
    );
  }

  if (!battleState) {
    return <div className="text-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Battle Field */}
      <div className="grid grid-cols-2 gap-8 p-8 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg">
        {/* Player 1 */}
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2">Player 1</h3>
          {battleState.player1.active ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-xl font-bold">{battleState.player1.active.species}</h4>
              <p className="text-sm text-gray-600">{battleState.player1.active.ability}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (battleState.player1.active as any).currentHP || 100)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-1">
                  HP: {((battleState.player1.active as any).currentHP || 100).toFixed(1)}%
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {battleState.player1.active.moves.join(' | ')}
              </div>
            </div>
          ) : (
            <div className="bg-gray-300 p-4 rounded-lg text-red-600 font-bold">
              기절 - 교체 필요
            </div>
          )}
          <div className="mt-4 text-sm">
            <p>남은 포켓몬: {battleState.player1.party.length - battleState.player1.fainted.length}</p>
            <p className="text-xs text-gray-600">기절: {battleState.player1.fainted.length}</p>
          </div>
        </div>

        {/* Player 2 */}
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2">Player 2</h3>
          {battleState.player2.active ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-xl font-bold">{battleState.player2.active.species}</h4>
              <p className="text-sm text-gray-600">{battleState.player2.active.ability}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (battleState.player2.active as any).currentHP || 100)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-1">
                  HP: {((battleState.player2.active as any).currentHP || 100).toFixed(1)}%
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {battleState.player2.active.moves.join(' | ')}
              </div>
            </div>
          ) : (
            <div className="bg-gray-300 p-4 rounded-lg text-red-600 font-bold">
              기절 - 교체 필요
            </div>
          )}
          <div className="mt-4 text-sm">
            <p>남은 포켓몬: {battleState.player2.party.length - battleState.player2.fainted.length}</p>
            <p className="text-xs text-gray-600">기절: {battleState.player2.fainted.length}</p>
          </div>
        </div>
      </div>

      {/* Turn Info */}
      <div className="text-center">
        <p className="text-2xl font-bold">Turn {battleState.turn}</p>
        {isProcessing && (
          <p className="text-sm text-blue-600 mt-2">AI가 생각 중...</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        {winner ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Player {winner} 승리!
            </h2>
          </div>
        ) : (
          <button
            onClick={processNextTurn}
            disabled={isProcessing}
            className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? '처리 중...' : 'Next Turn'}
          </button>
        )}
      </div>

      {/* Battle Log */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
        {battleState.log.slice(-15).map((entry, i) => (
          <div key={i} className="mb-1">
            <span className="text-gray-500">[Turn {entry.turn}]</span> {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}
