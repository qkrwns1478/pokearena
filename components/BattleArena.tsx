'use client';

import { useEffect, useRef } from 'react';
import { useBattleStore } from '@/store/battle-store';

export default function BattleArena() {
  const { currentBattle, logs, aiReasoning } = useBattleStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getCurrentTurnReasoning = () => {
    if (!currentBattle) return null;
    return aiReasoning.find((r) => r.turn === currentBattle.turn);
  };

  const turnReasoning = getCurrentTurnReasoning();

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* P1 AI Reasoning */}
      <div className="col-span-3 border border-blue-500 rounded p-4 bg-blue-50">
        <h3 className="font-bold text-blue-700 mb-3">Player 1 AI</h3>
        <div className="space-y-2 text-sm">
          {aiReasoning
            .filter((r) => r.p1Reason)
            .slice(-5)
            .map((r) => (
              <div key={r.turn} className="border-b border-blue-200 pb-2">
                <div className="text-xs text-gray-600">Turn {r.turn}</div>
                <div className="text-blue-900">{r.p1Reason}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Battle Arena Center */}
      <div className="col-span-6 space-y-4">
        {/* Pokemon Display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player 1 Pokemon */}
          <div className="border-2 border-blue-500 rounded p-4 bg-gradient-to-br from-blue-100 to-blue-50">
            {currentBattle?.activePokemon.p1 ? (
              <>
                <h4 className="font-bold text-lg text-blue-900">
                  {currentBattle.activePokemon.p1.name}
                </h4>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span>
                      {currentBattle.activePokemon.p1.hp}/
                      {currentBattle.activePokemon.p1.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          (currentBattle.activePokemon.p1.hp /
                            currentBattle.activePokemon.p1.maxHp) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                {currentBattle.activePokemon.p1.status && (
                  <div className="mt-2 text-sm">
                    <span className="px-2 py-1 bg-yellow-200 rounded">
                      {currentBattle.activePokemon.p1.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400">No active Pokemon</div>
            )}
          </div>

          {/* Player 2 Pokemon */}
          <div className="border-2 border-red-500 rounded p-4 bg-gradient-to-br from-red-100 to-red-50">
            {currentBattle?.activePokemon.p2 ? (
              <>
                <h4 className="font-bold text-lg text-red-900">
                  {currentBattle.activePokemon.p2.name}
                </h4>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span>
                      {currentBattle.activePokemon.p2.hp}/
                      {currentBattle.activePokemon.p2.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          (currentBattle.activePokemon.p2.hp /
                            currentBattle.activePokemon.p2.maxHp) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                {currentBattle.activePokemon.p2.status && (
                  <div className="mt-2 text-sm">
                    <span className="px-2 py-1 bg-yellow-200 rounded">
                      {currentBattle.activePokemon.p2.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400">No active Pokemon</div>
            )}
          </div>
        </div>

        {/* Battle Field Info */}
        {currentBattle && (
          <div className="border border-gray-300 rounded p-3 bg-gray-50">
            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold">Turn:</span> {currentBattle.turn}
              </div>
              {currentBattle.field.weather && (
                <div>
                  <span className="font-semibold">Weather:</span>{' '}
                  {currentBattle.field.weather}
                </div>
              )}
              {currentBattle.field.terrain && (
                <div>
                  <span className="font-semibold">Terrain:</span>{' '}
                  {currentBattle.field.terrain}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Battle Log */}
        <div className="border border-gray-300 rounded bg-white">
          <div className="bg-gray-100 px-4 py-2 font-semibold border-b">
            Battle Log
          </div>
          <div
            ref={logContainerRef}
            className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-1"
          >
            {logs.map((log, idx) => (
              <div key={idx} className="text-gray-800">
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-400">Waiting for battle to start...</div>
            )}
          </div>
        </div>
      </div>

      {/* P2 AI Reasoning */}
      <div className="col-span-3 border border-red-500 rounded p-4 bg-red-50">
        <h3 className="font-bold text-red-700 mb-3">Player 2 AI</h3>
        <div className="space-y-2 text-sm">
          {aiReasoning
            .filter((r) => r.p2Reason)
            .slice(-5)
            .map((r) => (
              <div key={r.turn} className="border-b border-red-200 pb-2">
                <div className="text-xs text-gray-600">Turn {r.turn}</div>
                <div className="text-red-900">{r.p2Reason}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
