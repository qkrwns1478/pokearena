'use client';

import { useState, useRef, useEffect } from 'react';
import { TeamManager } from '@/lib/teams';
import { BattleManager } from '@/lib/battle/engine';
import BattleArena from '@/components/BattleArena';
import { ITeam } from '@/types';
import { useBattleStore } from '@/store/useBattleStore';

export default function Home() {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [p1TeamId, setP1TeamId] = useState<string>('');
  const [p2TeamId, setP2TeamId] = useState<string>('');
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  
  // BattleManager 인스턴스 유지 (Ref 사용)
  const battleManagerRef = useRef<BattleManager | null>(null);
  const { isProcessing, winner } = useBattleStore(); // Store 상태 구독

  const p1Model = 'llama-3.3-70b-versatile'; 
  const p2Model = 'llama-3.3-70b-versatile';

  useEffect(() => {
    TeamManager.loadSample();
    setTeams(TeamManager.getTeams());
  }, []);

  const handleStartBattle = () => {
    const p1 = teams.find(t => t.id === p1TeamId);
    const p2 = teams.find(t => t.id === p2TeamId);

    if (!p1 || !p2) return alert('Please select teams for both players.');

    setIsBattleStarted(true);

    // 매니저 인스턴스 생성 및 시작
    const manager = new BattleManager(p1.packedTeam, p2.packedTeam, {
      generation: 9,
      battleFormat: 'customgame',
      p1Model,
      p2Model
    });
    
    battleManagerRef.current = manager;
    manager.start(); // 초기화 및 Team Preview 진입
  };

  const handleNextTurn = async () => {
    if (battleManagerRef.current) {
      await battleManagerRef.current.nextTurn();
    }
  };

  const handleReset = () => {
    setIsBattleStarted(false);
    battleManagerRef.current = null;
  };

  if (isBattleStarted) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col">
        {/* 상단 컨트롤 바 */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
          >
            Stop & Exit
          </button>
          
          {/* [New] Next Turn 버튼 */}
          {!winner && (
            <button 
              onClick={handleNextTurn}
              disabled={isProcessing}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-full font-black text-lg shadow-lg flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin text-xl">↻</span> Thinking...
                </>
              ) : (
                "NEXT TURN ▶"
              )}
            </button>
          )}
        </div>

        {/* 배틀 아레나 */}
        <div className="flex-1 p-4 overflow-hidden">
          <BattleArena />
        </div>
      </main>
    );
  }

  // (팀 선택 UI는 기존과 동일)
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      {/* ... 기존 UI 코드 ... */}
       <h1 className="text-4xl font-bold mb-8 text-yellow-400">PokeArena: AI Battle Simulator</h1>
      
      <div className="grid grid-cols-2 gap-12 w-full max-w-4xl mb-12">
        {/* Player 1 Settings */}
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Player 1</h2>
          <label className="block text-sm text-gray-400 mb-2">Select Team</label>
          <select 
            className="w-full p-3 bg-gray-700 rounded text-white mb-4"
            onChange={(e) => setP1TeamId(e.target.value)}
            value={p1TeamId}
          >
            <option value="">-- Select Team --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500">Model: {p1Model}</div>
        </div>

        {/* Player 2 Settings */}
        <div className="bg-gray-800 p-6 rounded-xl border border-red-500/30">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Player 2</h2>
          <label className="block text-sm text-gray-400 mb-2">Select Team</label>
          <select 
            className="w-full p-3 bg-gray-700 rounded text-white mb-4"
            onChange={(e) => setP2TeamId(e.target.value)}
            value={p2TeamId}
          >
            <option value="">-- Select Team --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500">Model: {p2Model}</div>
        </div>
      </div>

      <button
        onClick={handleStartBattle}
        disabled={!p1TeamId || !p2TeamId}
        className="px-12 py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-black text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
      >
        BATTLE START
      </button>

      <div className="mt-12 text-gray-600 text-sm">
        * No teams? Sample teams are auto-generated on first load.
      </div>
    </main>
  );
}