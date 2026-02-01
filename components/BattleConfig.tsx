'use client';

import { useTeamStore } from '@/store/team-store';
import { useBattleStore } from '@/store/battle-store';

export default function BattleConfig() {
  const { teams, selectedP1Team, selectedP2Team, selectP1Team, selectP2Team } = useTeamStore();
  const { config, setConfig } = useBattleStore();

  const groqModels = [
    'llama-3.3-70b-versatile',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3-32b'
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Player 1 Config */}
      <div className="border border-gray-300 rounded p-4 space-y-4">
        <h3 className="text-lg font-bold text-blue-600">Player 1</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Team</label>
          <select
            value={selectedP1Team?.id || ''}
            onChange={(e) => {
              const team = teams.find((t) => t.id === e.target.value);
              selectP1Team(team || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">AI Model</label>
          <select
            value={config.p1Model}
            onChange={(e) => setConfig({ p1Model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {groqModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Player 2 Config */}
      <div className="border border-gray-300 rounded p-4 space-y-4">
        <h3 className="text-lg font-bold text-red-600">Player 2</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Team</label>
          <select
            value={selectedP2Team?.id || ''}
            onChange={(e) => {
              const team = teams.find((t) => t.id === e.target.value);
              selectP2Team(team || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">AI Model</label>
          <select
            value={config.p2Model}
            onChange={(e) => setConfig({ p2Model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {groqModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Battle Rules */}
      <div className="col-span-2 border border-gray-300 rounded p-4 space-y-4">
        <h3 className="text-lg font-bold">Battle Rules</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Generation</label>
            <select
              value={config.generation}
              onChange={(e) => setConfig({ generation: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              {[9, 8, 7, 6, 5].map((gen) => (
                <option key={gen} value={gen}>
                  Gen {gen}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={config.battleFormat}
              onChange={(e) => setConfig({ battleFormat: e.target.value as 'singles' | 'doubles' })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Team Size</label>
            <select
              value={config.numPokemon}
              onChange={(e) => setConfig({ numPokemon: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value={3}>3v3</option>
              <option value={6}>6v6</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.rules.terastallize}
              onChange={(e) =>
                setConfig({
                  rules: { ...config.rules, terastallize: e.target.checked },
                })
              }
              className="rounded"
            />
            <span className="text-sm">Terastallize</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.rules.dynamax}
              onChange={(e) =>
                setConfig({
                  rules: { ...config.rules, dynamax: e.target.checked },
                })
              }
              className="rounded"
            />
            <span className="text-sm">Dynamax</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.rules.zMove}
              onChange={(e) =>
                setConfig({
                  rules: { ...config.rules, zMove: e.target.checked },
                })
              }
              className="rounded"
            />
            <span className="text-sm">Z-Moves</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.rules.megaEvolution}
              onChange={(e) =>
                setConfig({
                  rules: { ...config.rules, megaEvolution: e.target.checked },
                })
              }
              className="rounded"
            />
            <span className="text-sm">Mega Evolution</span>
          </label>
        </div>
      </div>
    </div>
  );
}
