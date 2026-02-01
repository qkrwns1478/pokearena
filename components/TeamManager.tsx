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
        <h2 className="text-xl font-bold">Team Manager</h2>
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showImport ? 'Cancel' : 'Import Team'}
        </button>
      </div>

      {showImport && (
        <div className="border border-gray-300 rounded p-4 space-y-3">
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
            placeholder="Paste Showdown team here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
          />
          <button
            onClick={handleImport}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Import
          </button>
        </div>
      )}

      <div className="space-y-2">
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No teams saved yet</p>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className="border border-gray-300 rounded p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-600">
                  {team.format} • {team.preview.join(', ')}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleExport(team.id)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Export
                </button>
                <button
                  onClick={() => removeTeam(team.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
