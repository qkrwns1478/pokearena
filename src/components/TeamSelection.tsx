'use client';

import { useState, useEffect } from 'react';
import { Party, BattleRules } from '@/lib/types';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';
import { getAIEntryRecommendation } from '@/lib/groq';

interface Props {
  party: Party;
  opponentParty: Party;
  playerNumber: 1 | 2;
  maxSelection: number;
  rules: BattleRules;
  onConfirm: (selectedIndices: number[]) => void;
}

export default function TeamSelection({ 
  party, 
  opponentParty,
  playerNumber, 
  maxSelection, 
  rules,
  onConfirm 
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string>('');

  // playerNumber가 변경될 때 선택 초기화
  useEffect(() => {
    setSelected([]);
    setAiReasoning('');
  }, [playerNumber, party.id]); // playerNumber와 party.id가 변경되면 초기화

  const toggleSelection = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else if (selected.length < maxSelection) {
      setSelected([...selected, index]);
    }
  };

  const handleAIRecommendation = async () => {
    setIsLoadingAI(true);
    setAiReasoning('');
    
    try {
      const recommendation = await getAIEntryRecommendation(
        party.pokemon,
        opponentParty.pokemon,
        rules,
        maxSelection
      );
      
      setSelected(recommendation.indices);
      setAiReasoning(recommendation.reasoning);
    } catch (error) {
      console.error('Failed to get AI recommendation:', error);
      setAiReasoning('AI 추천을 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const clearSelection = () => {
    setSelected([]);
    setAiReasoning('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            Player {playerNumber} - 출전 포켓몬 선택
          </h2>
          <p className="text-gray-600 mt-1">
            {maxSelection}마리를 선택하세요 ({selected.length}/{maxSelection})
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={clearSelection}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-bold"
          >
            선택 초기화
          </button>
          <button
            onClick={handleAIRecommendation}
            disabled={isLoadingAI}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition font-bold flex items-center gap-2"
          >
            {isLoadingAI ? (
              <>
                <span className="animate-spin">⏳</span>
                AI 분석 중...
              </>
            ) : (
              <>
                🤖 AI 추천
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Reasoning Display */}
      {aiReasoning && (
        <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <h3 className="font-bold text-purple-700 mb-2">AI 추천 전략</h3>
          <p className="text-sm text-gray-700">{aiReasoning}</p>
        </div>
      )}

      {/* Opponent Team Info */}
      <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <h3 className="font-bold text-red-700 mb-3">상대방 파티 정보</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {opponentParty.pokemon.map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-white p-2 rounded">
              <img
                src={getPokemonHomeIconUrl(p.species)}
                alt={p.species}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen3/0.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.species}</p>
                <p className="text-xs text-gray-600 truncate">{p.item || 'No Item'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pokemon Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {party.pokemon.map((p, i) => {
          const isSelected = selected.includes(i);
          const selectionOrder = isSelected ? selected.indexOf(i) + 1 : null;
          
          return (
            <button
              key={i}
              onClick={() => toggleSelection(i)}
              disabled={!isSelected && selected.length >= maxSelection}
              className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-400 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <div className="relative">
                <img
                  src={getPokemonHomeIconUrl(p.species)}
                  alt={p.species}
                  className="w-20 h-20 mx-auto object-contain mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen3/0.png';
                  }}
                />
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {selectionOrder}
                  </div>
                )}
              </div>
              <p className="font-bold text-center">{p.species}</p>
              <p className="text-sm text-gray-600 text-center">Lv.{p.level}</p>
              <p className="text-xs text-gray-500 text-center truncate">{p.item || 'No Item'}</p>
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {p.moves.slice(0, 2).map((move, mi) => (
                  <span key={mi} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {move}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <button
        onClick={() => onConfirm(selected)}
        disabled={selected.length !== maxSelection}
        className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition transform hover:scale-105 shadow-lg"
      >
        {selected.length === maxSelection ? '선택 완료' : `${maxSelection - selected.length}마리 더 선택하세요`}
      </button>
    </div>
  );
}
