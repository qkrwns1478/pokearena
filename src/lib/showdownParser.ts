import { PokemonData } from './types';

export interface ShowdownParseResult {
  success: boolean;
  pokemon: PokemonData[];
  errors: string[];
}

export const parseShowdownFormat = (text: string): ShowdownParseResult => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const pokemon: PokemonData[] = [];
  const errors: string[] = [];
  
  let currentPokemon: Partial<PokemonData> | null = null;
  let pokemonCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // New Pokemon (species line)
    if (!line.startsWith('-') && !line.startsWith('Ability:') && 
        !line.startsWith('Level:') && !line.startsWith('EVs:') && 
        !line.startsWith('IVs:') && !line.includes('Nature')) {
      
      // Save previous pokemon
      if (currentPokemon && currentPokemon.species && currentPokemon.moves && currentPokemon.moves.length > 0) {
        pokemon.push(finalizePokemon(currentPokemon, pokemonCount++));
      }

      // Start new pokemon
      currentPokemon = parseSpeciesLine(line);
    }
    // Ability
    else if (line.startsWith('Ability:')) {
      if (currentPokemon) {
        currentPokemon.ability = line.replace('Ability:', '').trim();
      }
    }
    // Level
    else if (line.startsWith('Level:')) {
      if (currentPokemon) {
        currentPokemon.level = parseInt(line.replace('Level:', '').trim()) || 50;
      }
    }
    // EVs
    else if (line.startsWith('EVs:')) {
      if (currentPokemon) {
        currentPokemon.evs = parseEVsOrIVs(line.replace('EVs:', '').trim());
      }
    }
    // IVs
    else if (line.startsWith('IVs:')) {
      if (currentPokemon) {
        currentPokemon.ivs = parseEVsOrIVs(line.replace('IVs:', '').trim());
      }
    }
    // Nature
    else if (line.includes('Nature')) {
      if (currentPokemon) {
        currentPokemon.nature = line.replace('Nature', '').trim();
      }
    }
    // Moves
    else if (line.startsWith('-')) {
      if (currentPokemon) {
        if (!currentPokemon.moves) currentPokemon.moves = [];
        const move = line.substring(1).trim();
        if (currentPokemon.moves.length < 4) {
          currentPokemon.moves.push(move);
        }
      }
    }
    // Tera Type
    else if (line.startsWith('Tera Type:')) {
      if (currentPokemon) {
        currentPokemon.teraType = line.replace('Tera Type:', '').trim();
      }
    }
  }

  // Save last pokemon
  if (currentPokemon && currentPokemon.species && currentPokemon.moves && currentPokemon.moves.length > 0) {
    pokemon.push(finalizePokemon(currentPokemon, pokemonCount++));
  }

  if (pokemon.length === 0) {
    errors.push('No valid Pokemon found in the text.');
  }

  return {
    success: pokemon.length > 0,
    pokemon,
    errors
  };
};

const parseSpeciesLine = (line: string): Partial<PokemonData> => {
  const result: Partial<PokemonData> = {
    level: 50,
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: 'Serious',
    moves: []
  };

  // Format: "Garchomp (M) @ Life Orb" or "Garchomp @ Life Orb" or just "Garchomp"
  const itemMatch = line.match(/@\s*(.+)$/);
  if (itemMatch) {
    result.item = itemMatch[1].trim();
    line = line.substring(0, itemMatch.index).trim();
  }

  // Remove gender if present
  line = line.replace(/\s*\([MF]\)\s*/, '').trim();

  // Remove nickname if present (format: "Nickname (Species)")
  const nicknameMatch = line.match(/^(.+?)\s*\((.+?)\)$/);
  if (nicknameMatch) {
    result.species = nicknameMatch[2].trim();
  } else {
    result.species = line.trim();
  }

  return result;
};

const parseEVsOrIVs = (text: string): { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } => {
  const stats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  
  const parts = text.split('/').map(p => p.trim());
  
  for (const part of parts) {
    const match = part.match(/(\d+)\s*(\w+)/);
    if (match) {
      const value = parseInt(match[1]);
      const stat = match[2].toLowerCase();
      
      if (stat === 'hp') stats.hp = value;
      else if (stat === 'atk') stats.atk = value;
      else if (stat === 'def') stats.def = value;
      else if (stat === 'spa') stats.spa = value;
      else if (stat === 'spd') stats.spd = value;
      else if (stat === 'spe') stats.spe = value;
    }
  }
  
  return stats;
};

const finalizePokemon = (partial: Partial<PokemonData>, index: number): PokemonData => {
  return {
    id: `${partial.species?.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${index}`,
    species: partial.species || 'Unknown',
    level: partial.level || 50,
    ability: partial.ability || 'Unknown',
    item: partial.item,
    nature: partial.nature || 'Serious',
    evs: partial.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: partial.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: partial.moves || [],
    teraType: partial.teraType
  };
};

// Export to Showdown format
export const exportToShowdownFormat = (pokemon: PokemonData[]): string => {
  return pokemon.map(p => {
    let text = '';
    
    // Species line with item
    text += p.item ? `${p.species} @ ${p.item}\n` : `${p.species}\n`;
    
    // Ability
    text += `Ability: ${p.ability}\n`;
    
    // Level (if not 100)
    if (p.level !== 100) {
      text += `Level: ${p.level}\n`;
    }
    
    // Tera Type
    if (p.teraType) {
      text += `Tera Type: ${p.teraType}\n`;
    }
    
    // EVs (if not all 0)
    const evs = p.evs;
    const evParts = [];
    if (evs.hp > 0) evParts.push(`${evs.hp} HP`);
    if (evs.atk > 0) evParts.push(`${evs.atk} Atk`);
    if (evs.def > 0) evParts.push(`${evs.def} Def`);
    if (evs.spa > 0) evParts.push(`${evs.spa} SpA`);
    if (evs.spd > 0) evParts.push(`${evs.spd} SpD`);
    if (evs.spe > 0) evParts.push(`${evs.spe} Spe`);
    if (evParts.length > 0) {
      text += `EVs: ${evParts.join(' / ')}\n`;
    }
    
    // Nature
    text += `${p.nature} Nature\n`;
    
    // IVs (if not all 31)
    const ivs = p.ivs;
    const ivParts = [];
    if (ivs.hp !== 31) ivParts.push(`${ivs.hp} HP`);
    if (ivs.atk !== 31) ivParts.push(`${ivs.atk} Atk`);
    if (ivs.def !== 31) ivParts.push(`${ivs.def} Def`);
    if (ivs.spa !== 31) ivParts.push(`${ivs.spa} SpA`);
    if (ivs.spd !== 31) ivParts.push(`${ivs.spd} SpD`);
    if (ivs.spe !== 31) ivParts.push(`${ivs.spe} Spe`);
    if (ivParts.length > 0) {
      text += `IVs: ${ivParts.join(' / ')}\n`;
    }
    
    // Moves
    p.moves.forEach(move => {
      text += `- ${move}\n`;
    });
    
    return text;
  }).join('\n');
};
