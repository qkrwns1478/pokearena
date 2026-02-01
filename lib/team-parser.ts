import { Teams } from '@pkmn/sim';
import { ITeam } from './types';

export function parseShowdownTeam(text: string, name: string, format: string): ITeam {
  try {
    // Validate that the team can be parsed
    const team = Teams.import(text);
    if (!team) {
      throw new Error('Invalid team format');
    }

    // Store the raw text instead of packed format
    const preview = team.map((pokemon) => pokemon.species);

    return {
      id: crypto.randomUUID(),
      name,
      format,
      packedTeam: text.trim(), // Store raw Showdown format
      preview,
    };
  } catch (error) {
    throw new Error(`Failed to parse team: ${error}`);
  }
}

export function exportShowdownTeam(team: ITeam): string {
  // Return the stored raw format directly
  return team.packedTeam;
}
