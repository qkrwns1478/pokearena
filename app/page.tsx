'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TeamManager from '@/components/TeamManager';
import BattleConfig from '@/components/BattleConfig';
import { useTeamStore } from '@/store/team-store';
import { useBattleStore } from '@/store/battle-store';

export default function Home() {
  const router = useRouter();
  const { selectedP1Team, selectedP2Team } = useTeamStore();
  const { battleHistory } = useBattleStore();
  const [activeTab, setActiveTab] = useState<'config' | 'teams' | 'history'>('config');

  const canStartBattle = selectedP1Team && selectedP2Team;

  const handleStartBattle = () => {
    if (!canStartBattle) {
      alert('Please select teams for both players');
      return;
    }
    router.push('/battle');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">⚔️ PokeArena</h1>
          <p className="text-center mt-2 text-blue-100">AI vs AI Battle Simulator</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'config'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Battle Setup
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'teams'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Team Manager
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Battle History
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <BattleConfig />
              
              {/* Start Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleStartBattle}
                  disabled={!canStartBattle}
                  className="px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {canStartBattle ? '⚔️ START BATTLE' : '⚠️ Select Teams First'}
                </button>
              </div>

              {/* Team Preview */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                <div className="text-center">
                  <h3 className="font-bold text-blue-600 mb-2">Player 1 Team</h3>
                  {selectedP1Team ? (
                    <div className="bg-blue-50 rounded p-4">
                      <div className="font-semibold">{selectedP1Team.name}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedP1Team.preview.join(' • ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 py-8">No team selected</div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-red-600 mb-2">Player 2 Team</h3>
                  {selectedP2Team ? (
                    <div className="bg-red-50 rounded p-4">
                      <div className="font-semibold">{selectedP2Team.name}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedP2Team.preview.join(' • ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 py-8">No team selected</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && <TeamManager />}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Recent Battles</h2>
              {battleHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No battles yet</p>
              ) : (
                battleHistory.map((battle) => (
                  <div
                    key={battle.id}
                    className="border border-gray-300 rounded p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {battle.p1TeamName} vs {battle.p2TeamName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(battle.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm mt-1">
                          Winner:{' '}
                          <span
                            className={`font-semibold ${
                              battle.winner === 'p1'
                                ? 'text-blue-600'
                                : battle.winner === 'p2'
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {battle.winner === 'p1'
                              ? battle.p1TeamName
                              : battle.winner === 'p2'
                              ? battle.p2TeamName
                              : 'Draw'}
                          </span>
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {battle.totalTurns} turns
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
