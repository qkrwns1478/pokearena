'use client';

import { useState } from 'react';
import PartyBuilder from '@/components/PartyBuilder';
import TeamSelection from '@/components/TeamSelection';
import BattleArena from '@/components/BattleArena';
import { Party, BattleRules } from '@/lib/types';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';
import { getEntryCount } from '@/lib/battle';

export default function Home() {
  const [step, setStep] = useState<'select' | 'entry' | 'setup' | 'battle'>('select');
  const [player1Party, setPlayer1Party] = useState<Party | null>(null);
  const [player2Party, setPlayer2Party] = useState<Party | null>(null);
  const [player1Entry, setPlayer1Entry] = useState<number[]>([]);
  const [player2Entry, setPlayer2Entry] = useState<number[]>([]);
  const [rules, setRules] = useState<BattleRules>({
    generation: 9,
    format: '6v6',
    battleType: 'singles',
    levelCap: 50,
    allowTerastal: true,
    allowDynamax: false,
    allowZMoves: false,
    allowMega: false,
    gimmickUsageLimit: 1
  });

  const [entryStep, setEntryStep] = useState<'p1' | 'p2'>('p1');

  const activeGimmicksCount = [
    rules.allowTerastal,
    rules.allowDynamax,
    rules.allowZMoves,
    rules.allowMega
  ].filter(Boolean).length;

  const handleGimmickLimitChange = (newLimit: number) => {
    const maxLimit = Math.max(1, activeGimmicksCount);
    setRules({ ...rules, gimmickUsageLimit: Math.min(newLimit, maxLimit) });
  };

  const handleGimmickToggle = (gimmick: keyof BattleRules, value: boolean) => {
    const newRules = { ...rules, [gimmick]: value };
    const newActiveCount = [
      newRules.allowTerastal,
      newRules.allowDynamax,
      newRules.allowZMoves,
      newRules.allowMega
    ].filter(Boolean).length;
    
    if (newRules.gimmickUsageLimit > newActiveCount) {
      newRules.gimmickUsageLimit = Math.max(1, newActiveCount);
    }
    
    setRules(newRules);
  };

  const entryCount = getEntryCount(rules.format);
  const needsEntry = entryCount < 6;

  const handlePlayer1EntryConfirm = (selected: number[]) => {
    setPlayer1Entry(selected);
    setEntryStep('p2');
  };

  const handlePlayer2EntryConfirm = (selected: number[]) => {
    setPlayer2Entry(selected);
    setStep('setup');
  };

  const handleFormatChange = (format: '1v1' | '3v3' | '6v6') => {
    setRules({ ...rules, format });
    // 포맷 변경 시 엔트리 초기화
    setPlayer1Entry([]);
    setPlayer2Entry([]);
    
    // 6v6로 변경하면 자동으로 전체 엔트리 설정
    if (format === '6v6' && player1Party && player2Party) {
      const p1Indices = Array.from({ length: player1Party.pokemon.length }, (_, i) => i);
      const p2Indices = Array.from({ length: player2Party.pokemon.length }, (_, i) => i);
      setPlayer1Entry(p1Indices);
      setPlayer2Entry(p2Indices);
    }
  };

  const handleProceedFromSelect = () => {
    const newEntryCount = getEntryCount(rules.format);
    const newNeedsEntry = newEntryCount < 6;
    
    if (newNeedsEntry) {
      // 엔트리 선발 필요
      setPlayer1Entry([]);
      setPlayer2Entry([]);
      setEntryStep('p1');
      setStep('entry');
    } else {
      // 6v6는 전체 엔트리
      if (player1Party && player2Party) {
        const p1Indices = Array.from({ length: player1Party.pokemon.length }, (_, i) => i);
        const p2Indices = Array.from({ length: player2Party.pokemon.length }, (_, i) => i);
        setPlayer1Entry(p1Indices);
        setPlayer2Entry(p2Indices);
      }
      setStep('setup');
    }
  };

  const handleBackFromSetup = () => {
    const currentNeedsEntry = getEntryCount(rules.format) < 6;
    
    if (currentNeedsEntry) {
      // 엔트리 선발로 돌아가기
      setEntryStep('p1');
      setPlayer1Entry([]);
      setPlayer2Entry([]);
      setStep('entry');
    } else {
      // 파티 선택으로 돌아가기
      setStep('select');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PokéArena
        </h1>
        <p className="text-center text-gray-600 mb-8">AI-Powered Pokémon Battle Simulator</p>

        {step === 'select' && (
          <div>
            <PartyBuilder 
              onSelectPlayer1={setPlayer1Party}
              onSelectPlayer2={setPlayer2Party}
              selectedPlayer1={player1Party}
              selectedPlayer2={player2Party}
            />
            
            {/* 포맷 선택 추가 */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">배틀 포맷 선택</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleFormatChange('1v1')}
                  className={`px-6 py-4 rounded-lg font-bold transition ${
                    rules.format === '1v1'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  1v1
                  <p className="text-xs mt-1 opacity-80">1마리 출전</p>
                </button>
                <button
                  onClick={() => handleFormatChange('3v3')}
                  className={`px-6 py-4 rounded-lg font-bold transition ${
                    rules.format === '3v3'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  3v3
                  <p className="text-xs mt-1 opacity-80">3마리 출전</p>
                </button>
                <button
                  onClick={() => handleFormatChange('6v6')}
                  className={`px-6 py-4 rounded-lg font-bold transition ${
                    rules.format === '6v6'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  6v6
                  <p className="text-xs mt-1 opacity-80">전체 출전</p>
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleProceedFromSelect}
                disabled={!player1Party || !player2Party}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition transform hover:scale-105 shadow-lg"
              >
                {needsEntry ? '엔트리 선발로' : '배틀 설정으로'} ({player1Party ? '✓' : '✗'} P1, {player2Party ? '✓' : '✗'} P2)
              </button>
            </div>
          </div>
        )}

        {step === 'entry' && player1Party && player2Party && (
          <div>
            <button
              onClick={() => setStep('select')}
              className="mb-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-bold"
            >
              파티 선택으로 돌아가기
            </button>
            
            {entryStep === 'p1' ? (
              <TeamSelection
                party={player1Party}
                opponentParty={player2Party}
                playerNumber={1}
                maxSelection={entryCount}
                rules={rules}
                onConfirm={handlePlayer1EntryConfirm}
              />
            ) : (
              <TeamSelection
                party={player2Party}
                opponentParty={player1Party}
                playerNumber={2}
                maxSelection={entryCount}
                rules={rules}
                onConfirm={handlePlayer2EntryConfirm}
              />
            )}
          </div>
        )}

        {step === 'setup' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">배틀 설정</h2>
            
            {/* Selected Teams Summary */}
            <div className="mb-8 grid grid-cols-2 gap-6 p-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl border-2 border-gray-200">
              <div>
                <h3 className="font-bold text-blue-600 text-lg mb-3">Player 1</h3>
                <p className="text-xl font-semibold mb-2">{player1Party?.name}</p>
                <p className="text-sm text-gray-600 mb-3">출전: {player1Entry.length}마리</p>
                <div className="flex flex-wrap gap-2">
                  {player1Entry.map((idx, i) => {
                    const p = player1Party!.pokemon[idx];
                    return (
                      <div key={i} className="relative group">
                        <img
                          src={getPokemonHomeIconUrl(p.species)}
                          alt={p.species}
                          className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen3/0.png';
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                          {p.species} Lv.{p.level}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-red-600 text-lg mb-3">Player 2</h3>
                <p className="text-xl font-semibold mb-2">{player2Party?.name}</p>
                <p className="text-sm text-gray-600 mb-3">출전: {player2Entry.length}마리</p>
                <div className="flex flex-wrap gap-2">
                  {player2Entry.map((idx, i) => {
                    const p = player2Party!.pokemon[idx];
                    return (
                      <div key={i} className="relative group">
                        <img
                          src={getPokemonHomeIconUrl(p.species)}
                          alt={p.species}
                          className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen3/0.png';
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                          {p.species} Lv.{p.level}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-gray-700 mb-3">세대</label>
                <select
                  value={rules.generation}
                  onChange={(e) => setRules({ ...rules, generation: Number(e.target.value) as any })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                    <option key={gen} value={gen}>Generation {gen}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-3">포맷 (변경불가)</label>
                <div className="w-full border-2 border-gray-300 bg-gray-100 rounded-lg px-4 py-3 text-gray-600 font-bold">
                  {rules.format}
                </div>
                <p className="text-xs text-gray-500 mt-1">포맷을 변경하려면 이전 단계로 돌아가세요</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-3">배틀 타입</label>
                <select
                  value={rules.battleType}
                  onChange={(e) => setRules({ ...rules, battleType: e.target.value as any })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="singles">Singles</option>
                  <option value="doubles">Doubles</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-3">레벨 제한</label>
                <select
                  value={rules.levelCap}
                  onChange={(e) => setRules({ ...rules, levelCap: Number(e.target.value) as 50 | 100 })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value={50}>Level 50 (VGC Standard)</option>
                  <option value={100}>Level 100 (Smogon Standard)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 text-lg">특수 기믹 설정</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className="flex items-center p-4 bg-white rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-gray-200 transition">
                  <input
                    type="checkbox"
                    checked={rules.allowTerastal}
                    onChange={(e) => handleGimmickToggle('allowTerastal', e.target.checked)}
                    className="mr-3 w-5 h-5"
                  />
                  <div>
                    <span className="font-bold">테라스탈</span>
                    <p className="text-xs text-gray-500">Generation 9</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 bg-white rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-gray-200 transition">
                  <input
                    type="checkbox"
                    checked={rules.allowDynamax}
                    onChange={(e) => handleGimmickToggle('allowDynamax', e.target.checked)}
                    className="mr-3 w-5 h-5"
                  />
                  <div>
                    <span className="font-bold">다이맥스</span>
                    <p className="text-xs text-gray-500">Generation 8</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 bg-white rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-gray-200 transition">
                  <input
                    type="checkbox"
                    checked={rules.allowZMoves}
                    onChange={(e) => handleGimmickToggle('allowZMoves', e.target.checked)}
                    className="mr-3 w-5 h-5"
                  />
                  <div>
                    <span className="font-bold">Z기술</span>
                    <p className="text-xs text-gray-500">Generation 7</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 bg-white rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-gray-200 transition">
                  <input
                    type="checkbox"
                    checked={rules.allowMega}
                    onChange={(e) => handleGimmickToggle('allowMega', e.target.checked)}
                    className="mr-3 w-5 h-5"
                  />
                  <div>
                    <span className="font-bold">메가진화</span>
                    <p className="text-xs text-gray-500">Generation 6</p>
                  </div>
                </label>
              </div>

              {activeGimmicksCount > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <label className="block font-bold text-gray-700 mb-3">
                    특수 기믹 사용 가능 횟수 (각 플레이어당)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max={activeGimmicksCount}
                      value={rules.gimmickUsageLimit}
                      onChange={(e) => handleGimmickLimitChange(Number(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-blue-600">{rules.gimmickUsageLimit}</span>
                      <p className="text-xs text-gray-600">/ {activeGimmicksCount} 최대</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    각 플레이어는 배틀 중 최대 {rules.gimmickUsageLimit}번의 특수 기믹을 사용할 수 있습니다.
                  </p>
                </div>
              )}

              {activeGimmicksCount === 0 && (
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center text-gray-600">
                  특수 기믹이 선택되지 않았습니다. 최소 하나 이상 선택해주세요.
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleBackFromSetup}
                className="px-6 py-3 bg-gray-500 text-white text-lg font-bold rounded-lg hover:bg-gray-600 transition"
              >
                뒤로
              </button>
              <button
                onClick={() => player1Party && player2Party && setStep('battle')}
                disabled={!player1Party || !player2Party}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-bold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition transform hover:scale-105 shadow-lg"
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
              className="mb-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-bold"
            >
              설정으로 돌아가기
            </button>
            <BattleArena
              player1Party={player1Party}
              player2Party={player2Party}
              player1Entry={player1Entry}
              player2Entry={player2Entry}
              rules={rules}
            />
          </div>
        )}
      </div>
    </main>
  );
}
