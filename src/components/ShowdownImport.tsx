'use client';

import { useState } from 'react';
import { parseShowdownFormat } from '@/lib/showdownParser';
import { Party } from '@/lib/types';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';

interface Props {
  onImport: (party: Party) => void;
  onCancel: () => void;
}

export default function ShowdownImport({ onImport, onCancel }: Props) {
  const [text, setText] = useState('');
  const [partyName, setPartyName] = useState('Imported Team');
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseShowdownFormat> | null>(null);

  const handleParse = () => {
    const result = parseShowdownFormat(text);
    setParseResult(result);
  };

  const handleImport = () => {
    if (parseResult && parseResult.success) {
      const party: Party = {
        id: `imported-${Date.now()}`,
        name: partyName,
        pokemon: parseResult.pokemon
      };
      onImport(party);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Pokemon Showdown 포맷 가져오기</h2>
          
          <div className="mb-4">
            <label className="block font-bold text-gray-700 mb-2">파티 이름</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="파티 이름 입력"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-gray-700 mb-2">Showdown 포맷 텍스트</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 border-2 border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder={`Garchomp @ Life Orb
Ability: Rough Skin
Level: 100
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Swords Dance

Dragapult @ Choice Specs
Ability: Infiltrator
...`}
            />
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold transition"
            >
              파싱하기
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold transition"
            >
              취소
            </button>
          </div>

          {parseResult && (
            <div className="mt-6">
              {parseResult.success ? (
                <div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-green-700 mb-2">
                      파싱 성공! {parseResult.pokemon.length}마리의 포켓몬을 찾았습니다.
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {parseResult.pokemon.map((p, i) => (
                      <div key={i} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={getPokemonHomeIconUrl(p.species)}
                            alt={p.species}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/gen3/0.png';
                            }}
                          />
                          <div>
                            <p className="font-bold">{p.species}</p>
                            <p className="text-sm text-gray-600">Lv.{p.level}</p>
                            <p className="text-xs text-gray-500">{p.item || 'No Item'}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">Ability:</span> {p.ability}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">Nature:</span> {p.nature}
                        </p>
                        <div className="text-xs text-gray-600 mt-2">
                          {p.moves.map((move, mi) => (
                            <div key={mi}>• {move}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleImport}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition"
                  >
                    파티 가져오기
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-red-700 mb-2">파싱 실패</h3>
                  {parseResult.errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
