// Cache for pokemon names
let pokemonNamesCache: string[] | null = null;
let isLoading = false;

// Fetch all pokemon names from PokeAPI
export const fetchAllPokemonNames = async (): Promise<string[]> => {
  if (pokemonNamesCache) {
    return pokemonNamesCache;
  }

  if (isLoading) {
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return pokemonNamesCache || [];
  }

  isLoading = true;

  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
    const data = await response.json();
    
    // Extract and format names - keep spaces for readability
    const names = data.results.map((p: any) => {
      // Convert kebab-case to proper format
      return p.name
        .split('-')
        .map((word: string, index: number) => {
          // Special handling for forms
          if (word === 'alola' || word === 'galar' || word === 'hisui' || 
              word === 'therian' || word === 'origin' || word === 'mega') {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' '); // Use space instead of dash for display
    });

    pokemonNamesCache = names;
    isLoading = false;
    return names;
  } catch (error) {
    console.error('Failed to fetch pokemon names:', error);
    isLoading = false;
    return fallbackPokemonNames;
  }
};

// Pokemon aliases for common nicknames
export const pokemonAliases: { [key: string]: string } = {
  // Paradox Pokemon
  'flutter': 'Flutter-Mane',
  'fmane': 'Flutter-Mane',
  'fluttermane': 'Flutter-Mane',
  'tusk': 'Great-Tusk',
  'gtusk': 'Great-Tusk',
  'greattusk': 'Great-Tusk',
  'moon': 'Roaring-Moon',
  'rmoon': 'Roaring-Moon',
  'roaringmoon': 'Roaring-Moon',
  'val': 'Iron-Valiant',
  'ival': 'Iron-Valiant',
  'ironvaliant': 'Iron-Valiant',
  'valiant': 'Iron-Valiant',
  'hands': 'Iron-Hands',
  'ironhands': 'Iron-Hands',
  'moth': 'Iron-Moth',
  'ironmoth': 'Iron-Moth',
  'treads': 'Iron-Treads',
  'irontreads': 'Iron-Treads',
  'bundle': 'Iron-Bundle',
  'ironbundle': 'Iron-Bundle',
  'jug': 'Iron-Jugulis',
  'jugulis': 'Iron-Jugulis',
  'ironjugulis': 'Iron-Jugulis',
  'thorns': 'Iron-Thorns',
  'ironthorns': 'Iron-Thorns',
  'boulder': 'Iron-Boulder',
  'ironboulder': 'Iron-Boulder',
  'crown': 'Iron-Crown',
  'icrown': 'Iron-Crown',
  'ironcrown': 'Iron-Crown',
  'leaves': 'Iron-Leaves',
  'ileaves': 'Iron-Leaves',
  'ironleaves': 'Iron-Leaves',
  'bonnet': 'Brute-Bonnet',
  'brutebonnet': 'Brute-Bonnet',
  'sandy': 'Sandy-Shocks',
  'shocks': 'Sandy-Shocks',
  'sandyshocks': 'Sandy-Shocks',
  'stail': 'Scream-Tail',
  'screamtail': 'Scream-Tail',
  'slither': 'Slither-Wing',
  'swing': 'Slither-Wing',
  'slitherwing': 'Slither-Wing',
  'wake': 'Walking-Wake',
  'ww': 'Walking-Wake',
  'walkingwake': 'Walking-Wake',
  'bolt': 'Raging-Bolt',
  'raging': 'Raging-Bolt',
  'ragingbolt': 'Raging-Bolt',
  'gfire': 'Gouging-Fire',
  'goug': 'Gouging-Fire',
  'gouging': 'Gouging-Fire',
  'gougingfire': 'Gouging-Fire',
  
  // Common Pokemon
  'chomp': 'Garchomp',
  'pult': 'Dragapult',
  'ghold': 'Gholdengo',
  'dengo': 'Gholdengo',
  'gambit': 'Kingambit',
  'pao': 'Chien-Pao',
  'chienpao': 'Chien-Pao',
  'ting': 'Ting-Lu',
  'tinglu': 'Ting-Lu',
  'clod': 'Clodsire',
  'pex': 'Toxapex',
  'corv': 'Corviknight',
  'lando': 'Landorus',
  'landot': 'Landorus-Therian',
  'landorustherian': 'Landorus-Therian',
  'dnite': 'Dragonite',
  'volc': 'Volcarona',
  'dirge': 'Skeledirge',
  'cress': 'Cresselia',
  'staka': 'Stakataka',
  'alowak': 'Marowak-Alola',
  'marowakalola': 'Marowak-Alola',
  'amoon': 'Amoonguss',
  'amoong': 'Amoonguss',
  'rhyp': 'Rhyperior',
  'tink': 'Tinkaton',
  'glimm': 'Glimmora',
  'pala': 'Palafin',
  'ceti': 'Cetitan',
  'bax': 'Baxcalibur'
};

// Fallback pokemon names (in case API fails)
const fallbackPokemonNames = [
  'Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard',
  'Squirtle', 'Wartortle', 'Blastoise', 'Pikachu', 'Raichu', 'Garchomp', 'Dragapult',
  'Kingambit', 'Great-Tusk', 'Flutter-Mane', 'Iron-Valiant', 'Gholdengo', 'Chien-Pao',
  'Ting-Lu', 'Clodsire', 'Toxapex', 'Corviknight', 'Landorus', 'Landorus-Therian',
  'Dragonite', 'Volcarona', 'Skeledirge', 'Cresselia', 'Roaring-Moon', 'Iron-Hands',
  'Iron-Moth', 'Iron-Treads', 'Tinkaton', 'Glimmora', 'Palafin', 'Baxcalibur'
];

// Normalize pokemon name
export const normalizePokemonName = (input: string): string => {
  const normalized = input.toLowerCase().trim().replace(/[^a-z0-9\-\s]/g, '');
  
  // Check aliases first
  const aliasKey = normalized.replace(/[\s\-]/g, '');
  if (pokemonAliases[aliasKey]) {
    // Convert dash to space for display
    return pokemonAliases[aliasKey].replace(/-/g, ' ');
  }
  
  // Check if it matches a known pokemon name (from cache if available)
  if (pokemonNamesCache) {
    const matchedName = pokemonNamesCache.find(
      name => name.toLowerCase() === normalized || 
              name.toLowerCase().replace(/[\s\-]/g, '') === aliasKey
    );
    
    if (matchedName) {
      return matchedName;
    }
  }
  
  // Capitalize first letter of each word
  return input.split(/[\s\-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Get autocomplete suggestions
export const getAutocompleteSuggestions = async (input: string, limit: number = 10): Promise<string[]> => {
  if (!input || input.length < 2) return [];
  
  // Ensure pokemon names are loaded
  const allNames = await fetchAllPokemonNames();
  
  const normalized = input.toLowerCase().trim().replace(/[^a-z0-9\-\s]/g, '');
  const suggestions: Set<string> = new Set();
  
  // Search in aliases
  Object.entries(pokemonAliases).forEach(([alias, fullName]) => {
    if (alias.includes(normalized) || normalized.includes(alias)) {
      suggestions.add(fullName);
    }
  });
  
  // Search in full names
  allNames.forEach(fullName => {
    const normalizedName = fullName.toLowerCase().replace(/[\s\-]/g, '');
    const searchTerm = normalized.replace(/[\s\-]/g, '');
    
    if (normalizedName.includes(searchTerm) || 
        fullName.toLowerCase().startsWith(normalized) ||
        normalizedName.startsWith(searchTerm)) {
      suggestions.add(fullName);
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
};

// Preload pokemon names on module load
if (typeof window !== 'undefined') {
  fetchAllPokemonNames().catch(console.error);
}

// Convert display name to Showdown format for API calls
export const toShowdownFormat = (displayName: string): string => {
  return displayName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[:.]/g, '')
    .replace(/'/g, '');
};
