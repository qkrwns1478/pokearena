'use client';

import { useBattleStore } from '@/store/useBattleStore';
import { useEffect, useRef } from 'react';

export default function BattleArena() {
  // [FIX] isRunning 삭제 -> isProcessing 추가
  const { battleLog, currentTurn, isProcessing } = useBattleStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const { winner } = battleLog;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLog.logs]);

  // 현재 턴의 Reasoning 찾기
  const activeReasoning = battleLog.aiReasoning.find(r => r.turn === currentTurn) || 
                          battleLog.aiReasoning[battleLog.aiReasoning.length - 1];

  return (
    <div className="flex flex-col h-screen max-h-[800px] p-4 gap-4 bg-gray-900 text-white">
      <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-xl font-bold text-blue-400">Player 1 (AI)</div>
        <div className="text-2xl font-black text-yellow-500">
          {winner ? `WINNER: ${winner.toUpperCase()}` : `TURN ${currentTurn}`}
        </div>
        <div className="text-xl font-bold text-red-400">Player 2 (AI)</div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* P1 Reasoning */}
        <div className="w-1/4 p-4 bg-gray-800 rounded-lg overflow-y-auto border border-blue-900/50">
          <h3 className="text-sm font-bold text-gray-400 mb-2">P1 Reasoning</h3>
          <div className="text-sm text-blue-200 italic whitespace-pre-wrap">
            {activeReasoning?.p1Reason || <span className="text-gray-600">- Waiting -</span>}
          </div>
        </div>

        {/* Log */}
        <div 
          ref={logContainerRef}
          className="flex-1 p-4 bg-black rounded-lg overflow-y-auto font-mono text-sm border border-gray-700 shadow-inner"
        >
          {battleLog.logs.map((log, i) => (
            <div key={i} className="mb-1 border-b border-gray-900 pb-1 break-words">
              {log}
            </div>
          ))}
          {/* [FIX] isRunning -> isProcessing으로 변경 */}
          {isProcessing && (
            <div className="animate-pulse text-yellow-500 mt-2 font-bold">
              AI is thinking & calculating...
            </div>
          )}
        </div>

        {/* P2 Reasoning */}
        <div className="w-1/4 p-4 bg-gray-800 rounded-lg overflow-y-auto border border-red-900/50">
          <h3 className="text-sm font-bold text-gray-400 mb-2">P2 Reasoning</h3>
          <div className="text-sm text-red-200 italic whitespace-pre-wrap">
            {activeReasoning?.p2Reason || <span className="text-gray-600">- Waiting -</span>}
          </div>
        </div>
      </div>
    </div>
  );
}