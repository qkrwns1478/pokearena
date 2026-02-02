// Pokemon Showdown sprites - more reliable and complete
export const getPokemonShowdownSprite = (species: string): string => {
  const formattedName = formatPokemonNameForShowdown(species);
  return `https://play.pokemonshowdown.com/sprites/dex/${formattedName}.png`;
};

// Pokemon HOME icon (use Showdown dex)
export const getPokemonHomeIconUrl = (species: string): string => {
  const formattedName = formatPokemonNameForShowdown(species);
  return `https://play.pokemonshowdown.com/sprites/dex/${formattedName}.png`;
};

// Pokemon Showdown animated sprite (front)
export const getPokemonSpriteUrl = (species: string, shiny: boolean = false): string => {
  const formattedName = formatPokemonNameForShowdown(species);
  const folder = shiny ? 'ani-shiny' : 'ani';
  return `https://play.pokemonshowdown.com/sprites/${folder}/${formattedName}.gif`;
};

// Pokemon Showdown back sprite
export const getPokemonBackSpriteUrl = (species: string, shiny: boolean = false): string => {
  const formattedName = formatPokemonNameForShowdown(species);
  const folder = shiny ? 'ani-back-shiny' : 'ani-back';
  return `https://play.pokemonshowdown.com/sprites/${folder}/${formattedName}.gif`;
};

// Large battle sprite (Gen 5 style)
export const getPokemonHomeSprite = (species: string): string => {
  const formattedName = formatPokemonNameForShowdown(species);
  return `https://play.pokemonshowdown.com/sprites/gen5/${formattedName}.png`;
};

// Format pokemon name for Showdown URLs
// Based on: https://play.pokemonshowdown.com/sprites/dex/
const formatPokemonNameForShowdown = (species: string): string => {
  let name = species
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[:.]/g, '')
    .replace(/'/g, '')
    .replace(/é/g, 'e')
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    // Replace spaces and dashes with hyphens for forms
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-'); // Remove double hyphens

  // Special cases for common forms
  const formMappings: { [key: string]: string } = {
    'landorus-therian': 'landorus-therian',
    'thundurus-therian': 'thundurus-therian',
    'tornadus-therian': 'tornadus-therian',
    'enamorus-therian': 'enamorus-therian',
    'marowak-alola': 'marowak-alola',
    'ninetales-alola': 'ninetales-alola',
    'raichu-alola': 'raichu-alola',
    'sandslash-alola': 'sandslash-alola',
    'vulpix-alola': 'vulpix-alola',
    'meowth-alola': 'meowth-alola',
    'persian-alola': 'persian-alola',
    'geodude-alola': 'geodude-alola',
    'graveler-alola': 'graveler-alola',
    'golem-alola': 'golem-alola',
    'grimer-alola': 'grimer-alola',
    'muk-alola': 'muk-alola',
    'exeggutor-alola': 'exeggutor-alola',
    'rotom-wash': 'rotom-wash',
    'rotom-heat': 'rotom-heat',
    'rotom-frost': 'rotom-frost',
    'rotom-fan': 'rotom-fan',
    'rotom-mow': 'rotom-mow',
    'giratina-origin': 'giratina-origin',
    'shaymin-sky': 'shaymin-sky',
    'basculegion': 'basculegion',
    'basculegion-f': 'basculegion-f',
    'urshifu-rapid-strike': 'urshifu-rapidstrike',
    'urshifu-single-strike': 'urshifu',
    'calyrex-ice': 'calyrex-ice',
    'calyrex-shadow': 'calyrex-shadow',
    'great-tusk': 'greattusk',
    'scream-tail': 'screamtail',
    'brute-bonnet': 'brutebonnet',
    'flutter-mane': 'fluttermane',
    'slither-wing': 'slitherwing',
    'sandy-shocks': 'sandyshocks',
    'iron-treads': 'irontreads',
    'iron-bundle': 'ironbundle',
    'iron-hands': 'ironhands',
    'iron-jugulis': 'ironjugulis',
    'iron-moth': 'ironmoth',
    'iron-thorns': 'ironthorns',
    'roaring-moon': 'roaringmoon',
    'iron-valiant': 'ironvaliant',
    'walking-wake': 'walkingwake',
    'iron-leaves': 'ironleaves',
    'gouging-fire': 'gougingfire',
    'raging-bolt': 'ragingbolt',
    'iron-boulder': 'ironboulder',
    'iron-crown': 'ironcrown',
    'chien-pao': 'chienpao',
    'ting-lu': 'tinglu',
    'chi-yu': 'chiyu',
    'wo-chien': 'wochien',
    'porygon-z': 'porygonz',
    'type-null': 'typenull',
    'tapu-koko': 'tapukoko',
    'tapu-lele': 'tapulele',
    'tapu-bulu': 'tapubulu',
    'tapu-fini': 'tapufini',
    'mr-mime': 'mrmime',
    'mr-rime': 'mrrime',
    'mime-jr': 'mimejr'
  };

  // Check if there's a special mapping
  if (formMappings[name]) {
    return formMappings[name];
  }

  // Default: remove all hyphens for non-form pokemon
  // Keep hyphens only for known forms
  if (!name.includes('alola') && !name.includes('galar') && 
      !name.includes('hisui') && !name.includes('paldea') &&
      !name.includes('therian') && !name.includes('origin') &&
      !name.includes('mega') && !name.includes('gmax')) {
    name = name.replace(/-/g, '');
  }

  return name;
};

// Fallback sprite (use local pokeball image)
export const getPokemonFallbackUrl = (): string => {
  return 'https://play.pokemonshowdown.com/sprites/gen3/0.png';
};

// Get type icon
export const getTypeIconUrl = (type: string): string => {
  return `https://play.pokemonshowdown.com/sprites/types/${type}.png`;
};

// Get item sprite
export const getItemSpriteUrl = (item: string): string => {
  const formattedItem = item.toLowerCase().replace(/\s+/g, '').replace(/'/g, '');
  return `https://play.pokemonshowdown.com/sprites/itemicons/${formattedItem}.png`;
};
