'use client';

import { useState } from 'react';
import { PokemonData } from '@/lib/types';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';
import { getAIPokemonRecommendation } from '@/lib/groq';

interface Props {
  pokemon: PokemonData | null;
  onSave: (pokemon: PokemonData) => void;
  onCancel: () => void;
}

const NATURES = [
  'Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile', 'Gentle',
  'Hardy', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest',
  'Naive', 'Naughty', 'Quiet', 'Quirky', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'
];

const TERA_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

export default function PokemonEditor({ pokemon, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<PokemonData>(
    pokemon || {
      id: `new-${Date.now()}`,
      species: '',
      level: 50,
      ability: '',
      item: '',
      nature: 'Serious',
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      moves: ['', '', '', ''],
      teraType: ''
    }
  );

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');

  const handleAIRecommendation = async () => {
    if (!formData.species.trim()) {
      alert('먼저 포켓몬 이름을 입력해주세요.');
      return;
    }

    setIsLoadingAI(true);
    setAiReasoning('');

    try {
      const recommendation = await getAIPokemonRecommendation(formData.species, 9);
      
      if (recommendation) {
        setFormData({
          ...formData,
          ability: recommendation.ability || formData.ability,
          item: recommendation.item || formData.item,
          nature: recommendation.nature || formData.nature,
          evs: recommendation.evs || formData.evs,
          moves: recommendation.moves || formData.moves,
          teraType: recommendation.teraType || formData.teraType
        });
        setAiReasoning('AI가 경쟁전 기준 최적화된 빌드를 추천했습니다.');
      } else {
        setAiReasoning('AI 추천을 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to get AI recommendation:', error);
      setAiReasoning('AI 추천을 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty moves
    const filteredMoves = formData.moves.filter(m => m.trim() !== '');
    
    if (!formData.species.trim() || !formData.ability.trim() || filteredMoves.length === 0) {
      alert('포켓몬 이름, 특성, 최소 1개의 기술을 입력해주세요.');
      return;
    }
    
    onSave({
      ...formData,
      moves: filteredMoves
    });
  };

  const updateEV = (stat: keyof typeof formData.evs, value: number) => {
    setFormData({
      ...formData,
      evs: { ...formData.evs, [stat]: Math.min(252, Math.max(0, value)) }
    });
  };

  const updateIV = (stat: keyof typeof formData.ivs, value: number) => {
    setFormData({
      ...formData,
      ivs: { ...formData.ivs, [stat]: Math.min(31, Math.max(0, value)) }
    });
  };

  const updateMove = (index: number, value: string) => {
    const newMoves = [...formData.moves];
    newMoves[index] = value;
    setFormData({ ...formData, moves: newMoves });
  };

  const evTotal = Object.values(formData.evs).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {pokemon ? '포켓몬 수정' : '새 포켓몬 추가'}
            </h2>
            
            <button
              type="button"
              onClick={handleAIRecommendation}
              disabled={isLoadingAI || !formData.species.trim()}
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

          {aiReasoning && (
            <div className="mb-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <p className="text-sm text-gray-700">{aiReasoning}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2">포켓몬 이름 *</label>
                <input
                  type="text"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="예: Garchomp"
                />
                <p className="text-xs text-gray-500 mt-1">영문 이름을 입력한 후 AI 추천을 눌러보세요</p>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={getPokemonHomeIconUrl(formData.species || 'bulbasaur')}
                  alt={formData.species}
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                  }}
                />
                <div className="flex-1">
                  <label className="block font-bold text-gray-700 mb-2">레벨</label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 50 })}
                    min="1"
                    max="100"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">특성 *</label>
                <input
                  type="text"
                  value={formData.ability}
                  onChange={(e) => setFormData({ ...formData, ability: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="예: Rough Skin"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">지닌 물건</label>
                <input
                  type="text"
                  value={formData.item || ''}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="예: Life Orb"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">성격</label>
                <select
                  value={formData.nature}
                  onChange={(e) => setFormData({ ...formData, nature: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {NATURES.map(nature => (
                    <option key={nature} value={nature}>{nature}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">테라스탈 타입</label>
                <select
                  value={formData.teraType || ''}
                  onChange={(e) => setFormData({ ...formData, teraType: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">없음</option>
                  {TERA_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2">기술 * (최소 1개)</label>
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    type="text"
                    value={formData.moves[i] || ''}
                    onChange={(e) => updateMove(i, e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 mb-2 focus:border-blue-500 focus:outline-none"
                    placeholder={`기술 ${i + 1}`}
                  />
                ))}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">노력치 (EVs)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const).map(stat => (
                    <div key={stat}>
                      <label className="text-sm text-gray-600 uppercase">{stat}</label>
                      <input
                        type="number"
                        value={formData.evs[stat]}
                        onChange={(e) => updateEV(stat, parseInt(e.target.value) || 0)}
                        min="0"
                        max="252"
                        step="4"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${evTotal > 510 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  합계: {evTotal} / 510 {evTotal > 510 && '⚠️ 초과!'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">개체값 (IVs)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const).map(stat => (
                    <div key={stat}>
                      <label className="text-sm text-gray-600 uppercase">{stat}</label>
                      <input
                        type="number"
                        value={formData.ivs[stat]}
                        onChange={(e) => updateIV(stat, parseInt(e.target.value) || 0)}
                        min="0"
                        max="31"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={evTotal > 510}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
