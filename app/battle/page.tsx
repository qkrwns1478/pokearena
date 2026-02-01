'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from '@/components/BattleArena';
import BattleControls from '@/components/BattleControls';
import { useTeamStore } from '@/store/team-store';
import { useBattleStore } from '@/store/battle-store';
import { BattleOrchestrator } from '@/lib/battle-engine';
import { exportShowdownTeam } from '@/lib/team-parser';

export default function BattlePage() {
  const router = useRouter();
  const { selectedP1Team, selectedP2Team } = useTeamStore();
  const {
    config,
    isPlaying,
    addLog,
    updateBattleState,
    addAIReasoning,
    saveBattleLog,
    setPlaying,
    resetBattle,
  } = useBattleStore();

  const [orchestrator, setOrchestrator] = useState<BattleOrchestrator | null>(null);

  useEffect(() => {
    if (!selectedP1Team || !selectedP2Team) {
      alert('No teams selected!');
      router.push('/');
    }
  }, [selectedP1Team, selectedP2Team, router]);

  const handleStartBattle = async () => {
    if (!selectedP1Team || !selectedP2Team) return;

    resetBattle();
    setPlaying(true);

    try {
      const p1Team = exportShowdownTeam(selectedP1Team);
      const p2Team = exportShowdownTeam(selectedP2Team);

      const orch = new BattleOrchestrator(p1Team, p2Team, config, {
        onLog: (log) => addLog(log),
        onStateUpdate: (state) => updateBattleState(state),
        onAIReasoning: (turn, side, reason) => addAIReasoning(turn, side, reason),
      });

      setOrchestrator(orch);

      const winner = await orch.runBattle();

      // Save battle log
      const battleLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        p1TeamName: selectedP1Team.name,
        p2TeamName: selectedP2Team.name,
        winner,
        totalTurns: useBattleStore.getState().currentBattle?.turn || 0,
        logs: useBattleStore.getState().logs,
        aiReasoning: useBattleStore.getState().aiReasoning,
      };

      saveBattleLog(battleLog);
      setPlaying(false);

      alert(`Battle finished! Winner: ${winner}`);
    } catch (error) {
      console.error('Battle error:', error);
      addLog(`Error: ${error}`);
      setPlaying(false);
    }
  };

  const handleStopBattle = () => {
    if (orchestrator) {
      orchestrator.stop();
    }
    setPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-red-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white bg-opacity-20 rounded text-black hover:bg-opacity-30"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">⚔️ Battle Arena</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Battle Arena */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
          <BattleArena />
        </div>
      </main>

      {/* Controls */}
      <BattleControls
        onStart={handleStartBattle}
        onStop={handleStopBattle}
        disabled={!selectedP1Team || !selectedP2Team || isPlaying}
      />
    </div>
  );
}
