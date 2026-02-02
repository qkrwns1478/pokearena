'use client';

import { useState, useEffect } from 'react';
import { Party } from '@/lib/types';
import { saveParty, getAllParties, deleteParty } from '@/lib/storage';
import { sampleParties } from '@/lib/sampleParties';

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
    deleteParty(id);
    loadParties();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">파티 선택</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={loadParties}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          파티 불러오기
        </button>
        
        <button
          onClick={createNewParty}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          새 파티 만들기
        </button>

        <button
          onClick={loadSampleParties}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          샘플 파티 불러오기
        </button>
      </div>

      {/* Selected Parties Display */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded border-2 border-blue-300">
          <h3 className="font-bold text-blue-700 mb-2">👤 Player 1</h3>
          {selectedPlayer1 ? (
            <div>
              <p className="font-semibold">{selectedPlayer1.name}</p>
              <p className="text-sm text-gray-600">
                {selectedPlayer1.pokemon.length} 포켓몬
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">파티를 선택해주세요</p>
          )}
        </div>

        <div className="p-4 bg-red-50 rounded border-2 border-red-300">
          <h3 className="font-bold text-red-700 mb-2">👤 Player 2</h3>
          {selectedPlayer2 ? (
            <div>
              <p className="font-semibold">{selectedPlayer2.name}</p>
              <p className="text-sm text-gray-600">
                {selectedPlayer2.pokemon.length} 포켓몬
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">파티를 선택해주세요</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parties.map((party) => {
          const isPlayer1 = selectedPlayer1?.id === party.id;
          const isPlayer2 = selectedPlayer2?.id === party.id;
          
          return (
            <div 
              key={party.id} 
              className={`border rounded p-4 ${
                isPlayer1 ? 'border-blue-500 bg-blue-50' : 
                isPlayer2 ? 'border-red-500 bg-red-50' : 
                ''
              }`}
            >
              <h3 className="font-bold text-lg">{party.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {party.pokemon.length} 포켓몬
              </p>
              <div className="text-xs text-gray-500 mb-3">
                {party.pokemon.slice(0, 3).map((p, i) => (
                  <div key={i}>• {p.species}</div>
                ))}
                {party.pokemon.length > 3 && (
                  <div>... +{party.pokemon.length - 3} more</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectPlayer1?.(party)}
                  className={`flex-1 px-3 py-1 text-white text-sm rounded ${
                    isPlayer1 
                      ? 'bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isPlayer1 ? '✓ P1' : 'P1'}
                </button>
                <button
                  onClick={() => onSelectPlayer2?.(party)}
                  className={`flex-1 px-3 py-1 text-white text-sm rounded ${
                    isPlayer2 
                      ? 'bg-red-700' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isPlayer2 ? '✓ P2' : 'P2'}
                </button>
                <button
                  onClick={() => handleDeleteParty(party.id)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
