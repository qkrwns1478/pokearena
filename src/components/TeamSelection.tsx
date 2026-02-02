'use client';

import { useState } from 'react';
import { Party } from '@/lib/types';
import { getPokemonHomeIconUrl } from '@/lib/pokemonSprites';

interface Props {
  party: Party;
  playerNumber: 1 | 2;
  maxSelection: number;
  onConfirm: (selectedIndices: number[]) => void;
}

export default function TeamSelection({ party, playerNumber, maxSelection, onConfirm }: Props) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelection = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else if (selected.length < maxSelection) {
      setSelected([...selected, index]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4">
        Player {playerNumber} - 출전 포켓몬 선택
      </h2>
      <p className="text-gray-600 mb-6">
        {maxSelection}마리를 선택하세요 ({selected.length}/{maxSelection})
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {party.pokemon.map((p, i) => (
          <button
            key={i}
            onClick={() => toggleSelection(i)}
            disabled={!selected.includes(i) && selected.length >= maxSelection}
            className={`p-4 rounded-xl border-2 transition ${
              selected.includes(i)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <img
              src={getPokemonHomeIconUrl(p.species)}
              alt={p.species}
              className="w-20 h-20 mx-auto object-contain mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
              }}
            />
            <p className="font-bold text-center">{p.species}</p>
            <p className="text-sm text-gray-600 text-center">Lv.{p.level}</p>
            {selected.includes(i) && (
              <div className="mt-2 bg-blue-500 text-white text-xs py-1 px-2 rounded">
                #{selected.indexOf(i) + 1} 선택됨
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onConfirm(selected)}
        disabled={selected.length !== maxSelection}
        className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition"
      >
        선택 완료
      </button>
    </div>
  );
}
