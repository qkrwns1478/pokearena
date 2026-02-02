'use client';

import { useState, useEffect } from 'react';
import { Party } from '@/lib/types';
import { saveParty, getAllParties, deleteParty } from '@/lib/storage';
import { sampleParties } from '@/lib/sampleParties';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';

interface Props {
  onSelectPlayer1?: (party: Party) => void;
  onSelectPlayer2?: (party: Party) => void;
  selectedPlayer1?: Party | null;
  selectedPlayer2?: Party | null;
}

export default function PartyBuilder({ 
  onSelectPlayer1, 
  onSelectPlayer2,
  selectedPlayer1,
  selectedPlayer2 
}: Props) {
  const [parties, setParties] = useState<Party[]>([]);
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = () => {
    setParties(getAllParties());
  };

  const createNewParty = () => {
    const newParty: Party = {
      id: Date.now().toString(),
      name: 'New Party',
      pokemon: []
    };
    saveParty(newParty);
    loadParties();
  };

  const loadSampleParties = () => {
    sampleParties.forEach(party => {
      saveParty({ ...party, id: `${party.id}-${Date.now()}` });
    });
    loadParties();
  };

  const handleDeleteParty = (id: string) => {
    if (confirm('정말로 이 파티를 삭제하시겠습니까?')) {
      deleteParty(id);
      loadParties();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedParty(expandedParty === id ? null : id);
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">파티 선택</h2>
      
      <div className="flex gap-3 mb-6">
        <button
          onClick={loadParties}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition transform hover:scale-105"
        >
          파티 불러오기
        </button>
        
        <button
          onClick={createNewParty}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition transform hover:scale-105"
        >
          새 파티 만들기
        </button>

        <button
          onClick={loadSampleParties}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold transition transform hover:scale-105"
        >
          샘플 파티 불러오기
        </button>
      </div>

      {/* Selected Parties Display */}
      <div className="mb-8 grid grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300">
          <h3 className="font-bold text-blue-700 mb-3 text-lg">Player 1</h3>
          {selectedPlayer1 ? (
            <div>
              <p className="font-bold text-xl mb-2">{selectedPlayer1.name}</p>
              <p className="text-sm text-gray-600 mb-3">{selectedPlayer1.pokemon.length}마리</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlayer1.pokemon.map((p, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={getPokemonHomeIconUrl(p.species)}
                      alt={p.species}
                      className="w-14 h-14 object-contain bg-white rounded-lg p-2 shadow hover:shadow-lg transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                      {p.species} Lv.{p.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">파티를 선택해주세요</p>
          )}
        </div>

        <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300">
          <h3 className="font-bold text-red-700 mb-3 text-lg">Player 2</h3>
          {selectedPlayer2 ? (
            <div>
              <p className="font-bold text-xl mb-2">{selectedPlayer2.name}</p>
              <p className="text-sm text-gray-600 mb-3">{selectedPlayer2.pokemon.length}마리</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlayer2.pokemon.map((p, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={getPokemonHomeIconUrl(p.species)}
                      alt={p.species}
                      className="w-14 h-14 object-contain bg-white rounded-lg p-2 shadow hover:shadow-lg transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                      {p.species} Lv.{p.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">파티를 선택해주세요</p>
          )}
        </div>
      </div>

      {/* Party List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parties.map((party) => {
          const isPlayer1 = selectedPlayer1?.id === party.id;
          const isPlayer2 = selectedPlayer2?.id === party.id;
          const isExpanded = expandedParty === party.id;
          
          return (
            <div 
              key={party.id} 
              className={`border-2 rounded-xl p-5 transition-all ${
                isPlayer1 ? 'border-blue-500 bg-blue-50 shadow-lg' : 
                isPlayer2 ? 'border-red-500 bg-red-50 shadow-lg' : 
                'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{party.name}</h3>
                  <p className="text-sm text-gray-600">{party.pokemon.length}마리</p>
                </div>
                <button
                  onClick={() => toggleExpand(party.id)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold px-2"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              </div>

              {/* Pokemon Preview */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {party.pokemon.slice(0, isExpanded ? undefined : 6).map((p, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={getPokemonHomeIconUrl(p.species)}
                        alt={p.species}
                        className="w-12 h-12 object-contain bg-gray-100 rounded-lg p-1 hover:bg-gray-200 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                        }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                        {p.species} Lv.{p.level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mb-4 text-xs space-y-2 bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
                  {party.pokemon.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 bg-white rounded">
                      <img
                        src={getPokemonHomeIconUrl(p.species)}
                        alt={p.species}
                        className="w-10 h-10 object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {p.species} <span className="text-gray-500">Lv.{p.level}</span>
                        </p>
                        <p className="text-gray-600 text-xs">{p.ability}</p>
                        <p className="text-gray-500 text-xs truncate">{p.moves.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectPlayer1?.(party)}
                  className={`flex-1 px-4 py-2 text-white text-sm font-bold rounded-lg transition transform hover:scale-105 ${
                    isPlayer1 
                      ? 'bg-blue-700 shadow-lg' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isPlayer1 ? 'P1 Selected' : 'Select P1'}
                </button>
                <button
                  onClick={() => onSelectPlayer2?.(party)}
                  className={`flex-1 px-4 py-2 text-white text-sm font-bold rounded-lg transition transform hover:scale-105 ${
                    isPlayer2 
                      ? 'bg-red-700 shadow-lg' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isPlayer2 ? 'P2 Selected' : 'Select P2'}
                </button>
                <button
                  onClick={() => handleDeleteParty(party.id)}
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition"
                  title="삭제"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {parties.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">저장된 파티가 없습니다</p>
          <p className="text-sm">샘플 파티를 불러오거나 새 파티를 만들어보세요</p>
        </div>
      )}
    </div>
  );
}
