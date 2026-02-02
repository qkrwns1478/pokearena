'use client';

import { useBattle } from '@/hooks/useBattle';
import { BattleRules, Party } from '@/lib/types';
import { useState } from 'react';
import { getPokemonHomeSprite, getPokemonHomeIconUrl } from '@/lib/pokemonSprites';

interface Props {
  player1Party: Party;
  player2Party: Party;
  player1Entry: number[];
  player2Entry: number[];
  rules: BattleRules;
}

export default function BattleArena({ player1Party, player2Party, player1Entry, player2Entry, rules }: Props) {
  const { battleState, isProcessing, winner, startBattle, processNextTurn } = useBattle();
  const [started, setStarted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const handleStart = async () => {
    await startBattle(player1Party, player2Party, player1Entry, player2Entry, rules);
    setStarted(true);
  };

  const handleNextTurn = async () => {
    await processNextTurn();
  };

  // Auto-play
  if (autoPlay && !isProcessing && !winner && battleState) {
    setTimeout(() => {
      processNextTurn();
    }, 2000);
  }

  if (!started) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
        <button
          onClick={handleStart}
          className="px-12 py-6 bg-white text-purple-600 text-2xl font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition shadow-2xl"
        >
          배틀 시작
        </button>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">배틀 준비 중...</p>
      </div>
    );
  }

  const getHPColor = (hp: number) => {
    if (hp > 50) return 'bg-green-500';
    if (hp > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* JRPG Style Battle View */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden" style={{ height: '500px' }}>
        
        {/* Opponent Side (Top) */}
        <div className="absolute top-8 right-12">
          {battleState.player2.active ? (
            <div className="relative">
              <img
                src={getPokemonHomeSprite(battleState.player2.active.species)}
                alt={battleState.player2.active.species}
                className="w-48 h-48 object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen5/substitute.png';
                }}
              />
              {/* Opponent HP Bar */}
              <div className="absolute -bottom-8 left-0 right-0 bg-gray-900 bg-opacity-90 rounded-lg p-3 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-bold text-sm">{battleState.player2.active.species}</span>
                  <span className="text-gray-400 text-xs">Lv.{battleState.player2.active.level}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getHPColor((battleState.player2.active as any).currentHP || 100)}`}
                    style={{
                      width: `${Math.max(0, (battleState.player2.active as any).currentHP || 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white text-center p-8">
              <p className="text-xl font-bold">기절</p>
            </div>
          )}
        </div>

        {/* Player Side (Bottom) */}
        <div className="absolute bottom-8 left-12">
          {battleState.player1.active ? (
            <div className="relative">
              <img
                src={getPokemonHomeSprite(battleState.player1.active.species)}
                alt={battleState.player1.active.species}
                className="w-48 h-48 object-contain drop-shadow-2xl transform scale-x-[-1]"
                style={{ filter: 'brightness(0.7)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen5/substitute.png';
                }}
              />
              {/* Player HP Bar */}
              <div className="absolute -top-8 left-0 right-0 bg-gray-900 bg-opacity-90 rounded-lg p-3 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-bold text-sm">{battleState.player1.active.species}</span>
                  <span className="text-gray-400 text-xs">Lv.{battleState.player1.active.level}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getHPColor((battleState.player1.active as any).currentHP || 100)}`}
                    style={{
                      width: `${Math.max(0, (battleState.player1.active as any).currentHP || 100)}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">HP</span>
                  <span className="text-white font-mono">{((battleState.player1.active as any).currentHP || 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white text-center p-8">
              <p className="text-xl font-bold">기절</p>
            </div>
          )}
        </div>

        {/* Team Icons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {battleState.player2.entry.map((p, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full border-2 ${
                battleState.player2.fainted.includes(p.id)
                  ? 'bg-gray-600 border-gray-500 opacity-50'
                  : battleState.player2.active?.id === p.id
                  ? 'bg-blue-500 border-white animate-pulse'
                  : 'bg-green-500 border-white'
              } flex items-center justify-center`}
            >
              <img
                src={getPokemonHomeIconUrl(p.species)}
                alt={p.species}
                className="w-8 h-8 object-contain"
              />
            </div>
          ))}
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          {battleState.player1.entry.map((p, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full border-2 ${
                battleState.player1.fainted.includes(p.id)
                  ? 'bg-gray-600 border-gray-500 opacity-50'
                  : battleState.player1.active?.id === p.id
                  ? 'bg-blue-500 border-white animate-pulse'
                  : 'bg-green-500 border-white'
              } flex items-center justify-center`}
            >
              <img
                src={getPokemonHomeIconUrl(p.species)}
                alt={p.species}
                className="w-8 h-8 object-contain"
              />
            </div>
          ))}
        </div>

        {/* Turn Counter */}
        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-90 px-4 py-2 rounded-lg">
          <p className="text-white font-bold">Turn {battleState.turn}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          {isProcessing && (
            <p className="text-sm text-blue-600 flex items-center">
              <span className="animate-pulse mr-2">처리 중...</span>
            </p>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                autoPlay
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {autoPlay ? 'Auto ON' : 'Auto OFF'}
            </button>
            {winner ? (
              <div className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg font-bold text-xl">
                Player {winner} 승리!
              </div>
            ) : (
              <button
                onClick={handleNextTurn}
                disabled={isProcessing || autoPlay}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold hover:from-blue-600 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? '처리 중...' : 'Next Turn'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <h3 className="text-green-400 font-bold">Battle Log</h3>
        </div>
        <div className="p-4 h-48 overflow-y-auto font-mono text-sm space-y-1">
          {battleState.log.slice(-15).map((entry, i) => (
            <div key={i} className="text-green-400">
              <span className="text-gray-500">[Turn {entry.turn}]</span>{' '}
              <span className={
                entry.type === 'faint' ? 'text-red-400 font-bold' :
                entry.type === 'damage' ? 'text-yellow-400' :
                entry.type === 'switch' ? 'text-blue-400' :
                'text-green-400'
              }>
                {entry.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
