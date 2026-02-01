import { Teams } from '@pkmn/sim';
import { ITeam } from './types';

export function parseShowdownTeam(text: string, name: string, format: string): ITeam {
  try {
    const team = Teams.import(text);
    if (!team) {
      throw new Error('Invalid team format');
    }

    const packedTeam = Teams.pack(team);
    const preview = team.map((pokemon) => pokemon.species);

    return {
      id: crypto.randomUUID(),
      name,
      format,
      packedTeam,
      preview,
    };
  } catch (error) {
    throw new Error(`Failed to parse team: ${error}`);
  }
}

export function exportShowdownTeam(team: ITeam): string {
  const unpacked = Teams.unpack(team.packedTeam);
  if (!unpacked) {
    throw new Error('Failed to unpack team');
  }
  return Teams.export(unpacked);
}
