'use client';

import { useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import { parseShowdownTeam, exportShowdownTeam } from '@/lib/team-parser';

export default function TeamManager() {
  const { teams, addTeam, removeTeam } = useTeamStore();
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [teamName, setTeamName] = useState('');
  const [format, setFormat] = useState('gen9ou');

  const handleImport = () => {
    try {
      const team = parseShowdownTeam(importText, teamName || 'Unnamed Team', format);
      addTeam(team);
      setImportText('');
      setTeamName('');
      setShowImport(false);
      alert('Team imported successfully!');
    } catch (error) {
      alert(`Failed to import team: ${error}`);
    }
  };

  const handleExport = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    try {
      const exported = exportShowdownTeam(team);
      navigator.clipboard.writeText(exported);
      alert('Team copied to clipboard!');
    } catch (error) {
      alert(`Failed to export team: ${error}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Team Manager</h2>
          <p className="text-sm text-gray-600 mt-1">
            {teams.length > 0 && teams.length <= 4 
              ? '4 sample teams loaded for testing' 
              : `${teams.length} teams available`}
          </p>
        </div>
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showImport ? 'Cancel' : '+ Import Custom Team'}
        </button>
      </div>

      {showImport && (
        <div className="border border-gray-300 rounded p-4 space-y-3 bg-blue-50">
          <h3 className="font-semibold text-blue-900">Import Custom Team</h3>
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="gen9ou">Gen 9 OU</option>
            <option value="gen8ou">Gen 8 OU</option>
            <option value="gen7ou">Gen 7 OU</option>
            <option value="gen9doubles">Gen 9 Doubles</option>
          </select>
          <textarea
            placeholder="Paste Showdown team here...&#10;&#10;Example:&#10;Garchomp @ Focus Sash&#10;Ability: Rough Skin&#10;EVs: 252 Atk / 4 SpD / 252 Spe&#10;Jolly Nature&#10;- Stealth Rock&#10;- Earthquake&#10;..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
          />
          <button
            onClick={handleImport}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Import Team
          </button>
        </div>
      )}

      <div className="space-y-2">
        {teams.length === 0 ? (
          <div className="text-center py-12 border border-gray-300 rounded bg-gray-50">
            <p className="text-gray-500 mb-2">No teams available</p>
            <p className="text-sm text-gray-400">Sample teams will be loaded automatically</p>
          </div>
        ) : (
          teams.map((team, idx) => (
            <div
              key={team.id}
              className="border border-gray-300 rounded p-4 flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{team.name}</h3>
                  {idx < 4 && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      Sample
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {team.format.toUpperCase()} • {team.preview.join(', ')}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleExport(team.id)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  📋 Export
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${team.name}"?`)) {
                      removeTeam(team.id);
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {teams.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          💡 Tip: You can export any team to clipboard and share it, or import your own custom teams
        </div>
      )}
    </div>
  );
}
