'use client';

import { useState, useEffect } from 'react';
import { PokemonData } from '@/lib/types';
import { getPokemonHomeIconUrl, getPokemonFallbackUrl } from '@/lib/pokemonSprites';
import { getAIPokemonRecommendation } from '@/lib/groq';
import { normalizePokemonName, getAutocompleteSuggestions } from '@/lib/pokemonNames';
import { translateKoreanToEnglish, containsKorean, getKoreanSuggestions } from '@/lib/pokemonKoreanNames';
import {
  getItemSuggestions,
  getAbilitySuggestions,
  getMoveSuggestions,
  translateItemKoreanToEnglish,
  translateAbilityKoreanToEnglish,
  translateMoveKoreanToEnglish
} from '@/lib/pokemonData';

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
  
  // Species autocomplete
  const [speciesSuggestions, setSpeciesSuggestions] = useState<string[]>([]);
  const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  
  // Ability autocomplete
  const [abilitySuggestions, setAbilitySuggestions] = useState<string[]>([]);
  const [showAbilitySuggestions, setShowAbilitySuggestions] = useState(false);
  
  // Item autocomplete
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  
  // Move autocomplete
  const [moveSuggestions, setMoveSuggestions] = useState<Array<string[]>>([[], [], [], []]);
  const [showMoveSuggestions, setShowMoveSuggestions] = useState<boolean[]>([false, false, false, false]);
  
  const [koreanDetected, setKoreanDetected] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Species change handler
  const handleSpeciesChange = async (value: string) => {
    setFormData({ ...formData, species: value });
    const isKorean = containsKorean(value);
    setKoreanDetected(isKorean);
    
    if (value.length >= 2) {
      setIsLoadingSpecies(true);
      if (isKorean) {
        const koreanSuggs = getKoreanSuggestions(value);
        const formattedSuggs = koreanSuggs.map(s => `${s.korean} → ${s.english}`);
        setSpeciesSuggestions(formattedSuggs);
        setShowSpeciesSuggestions(formattedSuggs.length > 0);
      } else {
        const newSuggestions = await getAutocompleteSuggestions(value);
        setSpeciesSuggestions(newSuggestions);
        setShowSpeciesSuggestions(newSuggestions.length > 0);
      }
      setIsLoadingSpecies(false);
    } else {
      setSpeciesSuggestions([]);
      setShowSpeciesSuggestions(false);
    }
  };

  // Ability change handler
  const handleAbilityChange = (value: string) => {
    setFormData({ ...formData, ability: value });
    if (value.length >= 2) {
      const suggestions = getAbilitySuggestions(value);
      setAbilitySuggestions(suggestions);
      setShowAbilitySuggestions(suggestions.length > 0);
    } else {
      setAbilitySuggestions([]);
      setShowAbilitySuggestions(false);
    }
  };

  // Item change handler
  const handleItemChange = (value: string) => {
    setFormData({ ...formData, item: value });
    if (value.length >= 2) {
      const suggestions = getItemSuggestions(value);
      setItemSuggestions(suggestions);
      setShowItemSuggestions(suggestions.length > 0);
    } else {
      setItemSuggestions([]);
      setShowItemSuggestions(false);
    }
  };

  // Move change handler
  const handleMoveChange = (index: number, value: string) => {
    const newMoves = [...formData.moves];
    newMoves[index] = value;
    setFormData({ ...formData, moves: newMoves });
    
    if (value.length >= 2) {
      const suggestions = getMoveSuggestions(value);
      const newMoveSuggestions = [...moveSuggestions];
      newMoveSuggestions[index] = suggestions;
      setMoveSuggestions(newMoveSuggestions);
      
      const newShowMoveSuggestions = [...showMoveSuggestions];
      newShowMoveSuggestions[index] = suggestions.length > 0;
      setShowMoveSuggestions(newShowMoveSuggestions);
    } else {
      const newMoveSuggestions = [...moveSuggestions];
      newMoveSuggestions[index] = [];
      setMoveSuggestions(newMoveSuggestions);
      
      const newShowMoveSuggestions = [...showMoveSuggestions];
      newShowMoveSuggestions[index] = false;
      setShowMoveSuggestions(newShowMoveSuggestions);
    }
  };

  // Select suggestion handlers
  const selectSpeciesSuggestion = (suggestion: string) => {
    if (suggestion.includes('→')) {
      const englishName = suggestion.split('→')[1].trim();
      setFormData({ ...formData, species: englishName });
    } else {
      setFormData({ ...formData, species: suggestion });
    }
    setShowSpeciesSuggestions(false);
    setKoreanDetected(false);
  };

  const selectAbilitySuggestion = (suggestion: string) => {
    const englishName = suggestion.includes('→') ? suggestion.split('→')[1].trim() : suggestion;
    setFormData({ ...formData, ability: englishName });
    setShowAbilitySuggestions(false);
  };

  const selectItemSuggestion = (suggestion: string) => {
    const englishName = suggestion.includes('→') ? suggestion.split('→')[1].trim() : suggestion;
    setFormData({ ...formData, item: englishName });
    setShowItemSuggestions(false);
  };

  const selectMoveSuggestion = (index: number, suggestion: string) => {
    const englishName = suggestion.includes('→') ? suggestion.split('→')[1].trim() : suggestion;
    const newMoves = [...formData.moves];
    newMoves[index] = englishName;
    setFormData({ ...formData, moves: newMoves });
    
    const newShowMoveSuggestions = [...showMoveSuggestions];
    newShowMoveSuggestions[index] = false;
    setShowMoveSuggestions(newShowMoveSuggestions);
  };

  // Blur handlers with Korean translation
  const handleSpeciesBlur = async () => {
    setTimeout(async () => {
      if (formData.species) {
        setIsTranslating(true);
        let finalName = formData.species;
        if (containsKorean(formData.species)) {
          finalName = await translateKoreanToEnglish(formData.species);
        }
        const normalized = normalizePokemonName(finalName);
        setFormData({ ...formData, species: normalized });
        setKoreanDetected(false);
        setIsTranslating(false);
      }
      setShowSpeciesSuggestions(false);
    }, 200);
  };

  const handleAbilityBlur = () => {
    setTimeout(() => {
      if (formData.ability && containsKorean(formData.ability)) {
        const translated = translateAbilityKoreanToEnglish(formData.ability);
        setFormData({ ...formData, ability: translated });
      }
      setShowAbilitySuggestions(false);
    }, 200);
  };

  const handleItemBlur = () => {
    setTimeout(() => {
      if (formData.item && containsKorean(formData.item)) {
        const translated = translateItemKoreanToEnglish(formData.item);
        setFormData({ ...formData, item: translated });
      }
      setShowItemSuggestions(false);
    }, 200);
  };

  const handleMoveBlur = (index: number) => {
    setTimeout(() => {
      if (formData.moves[index] && containsKorean(formData.moves[index])) {
        const newMoves = [...formData.moves];
        newMoves[index] = translateMoveKoreanToEnglish(formData.moves[index]);
        setFormData({ ...formData, moves: newMoves });
      }
      const newShowMoveSuggestions = [...showMoveSuggestions];
      newShowMoveSuggestions[index] = false;
      setShowMoveSuggestions(newShowMoveSuggestions);
    }, 200);
  };

  // AI recommendation handler
  const handleAIRecommendation = async () => {
    if (!formData.species.trim()) {
      alert('먼저 포켓몬 이름을 입력해주세요.');
      return;
    }

    setIsLoadingAI(true);
    setAiReasoning('');

    try {
      let speciesName = formData.species;
      if (containsKorean(speciesName)) {
        speciesName = await translateKoreanToEnglish(speciesName);
      }
      const normalizedSpecies = normalizePokemonName(speciesName);
      const recommendation = await getAIPokemonRecommendation(normalizedSpecies, 9);
      
      if (recommendation) {
        setFormData({
          ...formData,
          species: normalizedSpecies,
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

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredMoves = formData.moves.filter(m => m.trim() !== '');
    
    if (!formData.species.trim() || !formData.ability.trim() || filteredMoves.length === 0) {
      alert('포켓몬 이름, 특성, 최소 1개의 기술을 입력해주세요.');
      return;
    }
    
    let speciesName = formData.species;
    if (containsKorean(speciesName)) {
      speciesName = await translateKoreanToEnglish(speciesName);
    }
    const normalizedSpecies = normalizePokemonName(speciesName);
    
    onSave({
      ...formData,
      species: normalizedSpecies,
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

  const evTotal = Object.values(formData.evs).reduce((a, b) => a + b, 0);

  // Autocomplete component
  const AutocompleteDropdown = ({ 
    suggestions, 
    onSelect, 
    isLoading 
  }: { 
    suggestions: string[]; 
    onSelect: (s: string) => void; 
    isLoading?: boolean;
  }) => (
    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      {isLoading ? (
        <div className="px-4 py-3 text-gray-500 text-center">
          <span className="animate-pulse">검색 중...</span>
        </div>
      ) : suggestions.length > 0 ? (
        suggestions.map((suggestion, i) => (
          <div
            key={i}
            onMouseDown={() => onSelect(suggestion)}
            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm"
          >
            {suggestion}
          </div>
        ))
      ) : null}
    </div>
  );

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

          {koreanDetected && (
            <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                🌐 한국어가 감지되었습니다. PokeAPI를 통해 영문으로 자동 변환됩니다.
              </p>
            </div>
          )}

          {isTranslating && (
            <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">🔄 번역 중...</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Species */}
              <div className="relative">
                <label className="block font-bold text-gray-700 mb-2">
                  포켓몬 이름 * <span className="text-sm font-normal text-gray-500">(한글/영문)</span>
                </label>
                <input
                  type="text"
                  value={formData.species}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  onBlur={handleSpeciesBlur}
                  onFocus={() => {
                    if (speciesSuggestions.length > 0) setShowSpeciesSuggestions(true);
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="예: 이상해씨, Bulbasaur..."
                  autoComplete="off"
                />
                {showSpeciesSuggestions && (
                  <AutocompleteDropdown
                    suggestions={speciesSuggestions}
                    onSelect={selectSpeciesSuggestion}
                    isLoading={isLoadingSpecies}
                  />
                )}
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={getPokemonHomeIconUrl(formData.species || 'bulbasaur')}
                  alt={formData.species}
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getPokemonFallbackUrl();
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

              {/* Ability */}
              <div className="relative">
                <label className="block font-bold text-gray-700 mb-2">
                  특성 * <span className="text-sm font-normal text-gray-500">(한글/영문)</span>
                </label>
                <input
                  type="text"
                  value={formData.ability}
                  onChange={(e) => handleAbilityChange(e.target.value)}
                  onBlur={handleAbilityBlur}
                  onFocus={() => {
                    if (abilitySuggestions.length > 0) setShowAbilitySuggestions(true);
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="예: 까칠한피부, Rough Skin..."
                  autoComplete="off"
                />
                {showAbilitySuggestions && (
                  <AutocompleteDropdown
                    suggestions={abilitySuggestions}
                    onSelect={selectAbilitySuggestion}
                  />
                )}
              </div>

              {/* Item */}
              <div className="relative">
                <label className="block font-bold text-gray-700 mb-2">
                  지닌 물건 <span className="text-sm font-normal text-gray-500">(한글/영문)</span>
                </label>
                <input
                  type="text"
                  value={formData.item || ''}
                  onChange={(e) => handleItemChange(e.target.value)}
                  onBlur={handleItemBlur}
                  onFocus={() => {
                    if (itemSuggestions.length > 0) setShowItemSuggestions(true);
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="예: 생명의구슬, Life Orb..."
                  autoComplete="off"
                />
                {showItemSuggestions && (
                  <AutocompleteDropdown
                    suggestions={itemSuggestions}
                    onSelect={selectItemSuggestion}
                  />
                )}
              </div>

              {/* Nature */}
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

              {/* Tera Type */}
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
              {/* Moves */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">
                  기술 * (최소 1개) <span className="text-sm font-normal text-gray-500">(한글/영문)</span>
                </label>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="relative mb-2">
                    <input
                      type="text"
                      value={formData.moves[i] || ''}
                      onChange={(e) => handleMoveChange(i, e.target.value)}
                      onBlur={() => handleMoveBlur(i)}
                      onFocus={() => {
                        if (moveSuggestions[i].length > 0) {
                          const newShow = [...showMoveSuggestions];
                          newShow[i] = true;
                          setShowMoveSuggestions(newShow);
                        }
                      }}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder={`기술 ${i + 1} (예: 지진, Earthquake)`}
                      autoComplete="off"
                    />
                    {showMoveSuggestions[i] && (
                      <AutocompleteDropdown
                        suggestions={moveSuggestions[i]}
                        onSelect={(s) => selectMoveSuggestion(i, s)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* EVs */}
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

              {/* IVs */}
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
