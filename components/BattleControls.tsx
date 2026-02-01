'use client';

import { useBattleStore } from '@/store/battle-store';

interface BattleControlsProps {
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  disabled: boolean;
}

export default function BattleControls({ onStart, onStop, onPause, disabled }: BattleControlsProps) {
  const { isPlaying, isPaused, speed, setPaused, setSpeed } = useBattleStore();

  return (
    <div className="flex items-center justify-center space-x-4 p-4 border-t border-gray-300">
      {!isPlaying ? (
        <button
          onClick={onStart}
          disabled={disabled}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          START BATTLE
        </button>
      ) : (
        <>
          <button
            onClick={onPause}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Stop
          </button>
        </>
      )}

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Speed:</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded"
          disabled={!isPlaying}
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={0}>Instant</option>
        </select>
      </div>
    </div>
  );
}
