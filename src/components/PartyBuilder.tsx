'use client';

import { useState, useEffect } from 'react';
import { Party, PokemonData } from '@/lib/types';
import { saveParty, getAllParties, deleteParty } from '@/lib/storage';
import { sampleParties } from '@/lib/sampleParties';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';
import { exportToShowdownFormat } from '@/lib/showdownParser';
import ShowdownImport from './ShowdownImport';
import PokemonEditor from './PokemonEditor';

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
  const [showImport, setShowImport] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [editingPokemon, setEditingPokemon] = useState<{ pokemon: PokemonData | null } | null>(null);

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
    setEditingParty(newParty);
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

  const handleImport = (party: Party) => {
    saveParty(party);
    setShowImport(false);
    loadParties();
  };

  const handleExport = (party: Party) => {
    const exported = exportToShowdownFormat(party.pokemon);
    navigator.clipboard.writeText(exported);
    alert('Showdown 포맷이 클립보드에 복사되었습니다!');
  };

  const handleSaveParty = () => {
    if (editingParty) {
      saveParty(editingParty);
      setEditingParty(null);
      loadParties();
    }
  };

  const handleAddPokemon = () => {
    setEditingPokemon({ pokemon: null });
  };

  const handleEditPokemon = (pokemon: PokemonData) => {
    setEditingPokemon({ pokemon });
  };

  const handleSavePokemon = (pokemon: PokemonData) => {
    if (editingParty) {
      const existingIndex = editingParty.pokemon.findIndex(p => p.id === pokemon.id);
      let newPokemon;
      
      if (existingIndex >= 0) {
        // Update existing
        newPokemon = [...editingParty.pokemon];
        newPokemon[existingIndex] = pokemon;
      } else {
        // Add new
        newPokemon = [...editingParty.pokemon, pokemon];
      }
      
      setEditingParty({ ...editingParty, pokemon: newPokemon });
      setEditingPokemon(null);
    }
  };

  const handleDeletePokemon = (pokemonId: string) => {
    if (editingParty && confirm('이 포켓몬을 삭제하시겠습니까?')) {
      setEditingParty({
        ...editingParty,
        pokemon: editingParty.pokemon.filter(p => p.id !== pokemonId)
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedParty(expandedParty === id ? null : id);
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">파티 선택</h2>
      
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={loadParties}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition transform hover:scale-105"
        >
          🔄 새로고침
        </button>
        
        <button
          onClick={createNewParty}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition transform hover:scale-105"
        >
          새 파티 만들기
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold transition transform hover:scale-105"
        >
          Showdown 가져오기
        </button>

        <button
          onClick={loadSampleParties}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold transition transform hover:scale-105"
        >
          샘플 파티 불러오기
        </button>
      </div>

      {/* Selected Parties Display */}
      {(selectedPlayer1 || selectedPlayer2) && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border-2 border-gray-200">
          <h3 className="font-bold text-lg mb-3">선택된 파티</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">Player 1</p>
              {selectedPlayer1 ? (
                <div>
                  <p className="font-bold mb-2">{selectedPlayer1.name} ({selectedPlayer1.pokemon.length}마리)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayer1.pokemon.map((p, i) => (
                      <img
                        key={i}
                        src={getPokemonHomeIconUrl(p.species)}
                        alt={p.species}
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow"
                        title={p.species}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">선택되지 않음</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600 mb-2">Player 2</p>
              {selectedPlayer2 ? (
                <div>
                  <p className="font-bold mb-2">{selectedPlayer2.name} ({selectedPlayer2.pokemon.length}마리)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayer2.pokemon.map((p, i) => (
                      <img
                        key={i}
                        src={getPokemonHomeIconUrl(p.species)}
                        alt={p.species}
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow"
                        title={p.species}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">선택되지 않음</p>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="font-bold text-xl text-gray-800">{party.name}</h3>
                  <p className="text-sm text-gray-600">{party.pokemon.length} 포켓몬</p>
                </div>
                <button
                  onClick={() => toggleExpand(party.id)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              </div>

              {/* Pokemon Icons Preview (Always visible) */}
              <div className="mb-3 flex flex-wrap gap-2">
                {party.pokemon.slice(0, 6).map((p, i) => (
                  <img
                    key={i}
                    src={getPokemonHomeIconUrl(p.species)}
                    alt={p.species}
                    className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1 border border-gray-200"
                    title={`${p.species} Lv.${p.level}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                    }}
                  />
                ))}
              </div>

              {isExpanded && (
                <div className="mb-3 space-y-2 pt-3 border-t border-gray-200">
                  {party.pokemon.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <img
                        src={getPokemonHomeIconUrl(p.species)}
                        alt={p.species}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{p.species}</p>
                        <p className="text-xs text-gray-600">Lv.{p.level} • {p.ability}</p>
                        <p className="text-xs text-gray-500 truncate">{p.moves.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onSelectPlayer1?.(party)}
                  className={`flex-1 px-4 py-2 text-white text-sm font-bold rounded-lg transition transform hover:scale-105 ${
                    isPlayer1 
                      ? 'bg-blue-700 shadow-lg' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isPlayer1 ? 'P1 ✓' : 'P1'}
                </button>
                <button
                  onClick={() => onSelectPlayer2?.(party)}
                  className={`flex-1 px-4 py-2 text-white text-sm font-bold rounded-lg transition transform hover:scale-105 ${
                    isPlayer2 
                      ? 'bg-red-700 shadow-lg' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isPlayer2 ? 'P2 ✓' : 'P2'}
                </button>
                <button
                  onClick={() => setEditingParty(party)}
                  className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition"
                  title="수정"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleExport(party)}
                  className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition"
                  title="Showdown 포맷으로 내보내기"
                >
                  ↗
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

      {/* Modals */}
      {showImport && (
        <ShowdownImport
          onImport={handleImport}
          onCancel={() => setShowImport(false)}
        />
      )}

      {editingParty && (
        <PartyEditorModal
          party={editingParty}
          onSave={handleSaveParty}
          onCancel={() => setEditingParty(null)}
          onAddPokemon={handleAddPokemon}
          onEditPokemon={handleEditPokemon}
          onDeletePokemon={handleDeletePokemon}
          onNameChange={(name) => setEditingParty({ ...editingParty, name })}
        />
      )}

      {editingPokemon && editingParty && (
        <PokemonEditor
          pokemon={editingPokemon.pokemon}
          onSave={handleSavePokemon}
          onCancel={() => setEditingPokemon(null)}
        />
      )}
    </div>
  );
}

// Party Editor Modal Component
function PartyEditorModal({ 
  party, 
  onSave, 
  onCancel, 
  onAddPokemon, 
  onEditPokemon, 
  onDeletePokemon,
  onNameChange 
}: {
  party: Party;
  onSave: () => void;
  onCancel: () => void;
  onAddPokemon: () => void;
  onEditPokemon: (p: PokemonData) => void;
  onDeletePokemon: (id: string) => void;
  onNameChange: (name: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">파티 편집</h2>
          
          <div className="mb-4">
            <label className="block font-bold text-gray-700 mb-2">파티 이름</label>
            <input
              type="text"
              value={party.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block font-bold text-gray-700">포켓몬 ({party.pokemon.length}/6)</label>
              <button
                onClick={onAddPokemon}
                disabled={party.pokemon.length >= 6}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold transition"
              >
                + 포켓몬 추가
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {party.pokemon.map((p) => (
                <div key={p.id} className="border-2 border-gray-200 rounded-lg p-4 flex items-center gap-3">
                  <img
                    src={getPokemonHomeIconUrl(p.species)}
                    alt={p.species}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{p.species}</p>
                    <p className="text-sm text-gray-600">Lv.{p.level} • {p.ability}</p>
                    <p className="text-xs text-gray-500">{p.item || 'No Item'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditPokemon(p)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDeletePokemon(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {party.pokemon.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>포켓몬이 없습니다. "포켓몬 추가" 버튼을 클릭하세요.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold transition"
            >
              취소
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
