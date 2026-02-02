'use client';

import { useState } from 'react';
import PartyBuilder from '@/components/PartyBuilder';
import BattleArena from '@/components/BattleArena';
import { Party, BattleRules } from '@/lib/types';

export default function Home() {
  const [step, setStep] = useState<'select' | 'setup' | 'battle'>('select');
  const [player1Party, setPlayer1Party] = useState<Party | null>(null);
  const [player2Party, setPlayer2Party] = useState<Party | null>(null);
  const [rules, setRules] = useState<BattleRules>({
    generation: 9,
    format: '6v6',
    battleType: 'singles',
    levelCap: 100,
    allowTerastal: true,
    allowDynamax: false,
    allowZMoves: false,
    allowMega: false
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🎮 PokéArena
        </h1>

        {step === 'select' && (
          <div>
            <PartyBuilder 
              onSelectPlayer1={setPlayer1Party}
              onSelectPlayer2={setPlayer2Party}
              selectedPlayer1={player1Party}
              selectedPlayer2={player2Party}
            />
            <div className="mt-8 text-center">
              <button
                onClick={() => setStep('setup')}
                disabled={!player1Party || !player2Party}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                배틀 설정으로 ({player1Party ? '✓' : '✗'} P1, {player2Party ? '✓' : '✗'} P2)
              </button>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">배틀 설정</h2>
            
            {/* Selected Teams Summary */}
            <div className="mb-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <h3 className="font-bold text-blue-600">Player 1: {player1Party?.name}</h3>
                <p className="text-sm text-gray-600">{player1Party?.pokemon.length} 포켓몬</p>
              </div>
              <div>
                <h3 className="font-bold text-red-600">Player 2: {player2Party?.name}</h3>
                <p className="text-sm text-gray-600">{player2Party?.pokemon.length} 포켓몬</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">세대</label>
                <select
                  value={rules.generation}
                  onChange={(e) => setRules({ ...rules, generation: Number(e.target.value) as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                    <option key={gen} value={gen}>Generation {gen}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">포맷</label>
                <select
                  value={rules.format}
                  onChange={(e) => setRules({ ...rules, format: e.target.value as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="1v1">1v1</option>
                  <option value="3v3">3v3</option>
                  <option value="6v6">6v6</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">배틀 타입</label>
                <select
                  value={rules.battleType}
                  onChange={(e) => setRules({ ...rules, battleType: e.target.value as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="singles">Singles</option>
                  <option value="doubles">Doubles</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rules.allowTerastal}
                    onChange={(e) => setRules({ ...rules, allowTerastal: e.target.checked })}
                    className="mr-2"
                  />
                  테라스탈 허용
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rules.allowDynamax}
                    onChange={(e) => setRules({ ...rules, allowDynamax: e.target.checked })}
                    className="mr-2"
                  />
                  다이맥스 허용
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rules.allowZMoves}
                    onChange={(e) => setRules({ ...rules, allowZMoves: e.target.checked })}
                    className="mr-2"
                  />
                  Z기술 허용
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rules.allowMega}
                    onChange={(e) => setRules({ ...rules, allowMega: e.target.checked })}
                    className="mr-2"
                  />
                  메가진화 허용
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setStep('select')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                뒤로
              </button>
              <button
                onClick={() => player1Party && player2Party && setStep('battle')}
                disabled={!player1Party || !player2Party}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                배틀 시작
              </button>
            </div>
          </div>
        )}

        {step === 'battle' && player1Party && player2Party && (
          <div>
            <button
              onClick={() => setStep('setup')}
              className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← 설정으로 돌아가기
            </button>
            <BattleArena
              player1Party={player1Party}
              player2Party={player2Party}
              rules={rules}
            />
          </div>
        )}
      </div>
    </main>
  );
}
