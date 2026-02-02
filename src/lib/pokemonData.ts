// Cache for items, abilities, and moves
let itemsCache: Array<{ english: string; korean: string }> = [];
let abilitiesCache: Array<{ english: string; korean: string }> = [];
let movesCache: Array<{ english: string; korean: string }> = [];
let isCacheReady = { items: false, abilities: false, moves: false };

// Fetch all items
export const fetchAllItems = async (): Promise<Array<{ english: string; korean: string }>> => {
  if (itemsCache.length > 0) return itemsCache;

  try {
    const response = await fetch('https://pokeapi.co/api/v2/item?limit=2000');
    const data = await response.json();

    const promises = data.results.slice(0, 300).map(async (item: any) => {
      try {
        const itemResponse = await fetch(item.url);
        const itemData = await itemResponse.json();

        const englishName = itemData.names.find((n: any) => n.language.name === 'en');
        const koreanName = itemData.names.find((n: any) => n.language.name === 'ko');

        if (englishName && koreanName) {
          return { english: englishName.name, korean: koreanName.name };
        }
      } catch (error) {
        console.error(`Failed to fetch item: ${item.name}`, error);
      }
      return null;
    });

    const results = await Promise.all(promises);
    itemsCache = results.filter(r => r !== null) as Array<{ english: string; korean: string }>;
    isCacheReady.items = true;
    console.log(`Items cache built: ${itemsCache.length} entries`);
    return itemsCache;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
};

// Fetch all abilities
export const fetchAllAbilities = async (): Promise<Array<{ english: string; korean: string }>> => {
  if (abilitiesCache.length > 0) return abilitiesCache;

  try {
    const response = await fetch('https://pokeapi.co/api/v2/ability?limit=500');
    const data = await response.json();

    const promises = data.results.map(async (ability: any) => {
      try {
        const abilityResponse = await fetch(ability.url);
        const abilityData = await abilityResponse.json();

        const englishName = abilityData.names.find((n: any) => n.language.name === 'en');
        const koreanName = abilityData.names.find((n: any) => n.language.name === 'ko');

        if (englishName && koreanName) {
          return { english: englishName.name, korean: koreanName.name };
        }
      } catch (error) {
        console.error(`Failed to fetch ability: ${ability.name}`, error);
      }
      return null;
    });

    const results = await Promise.all(promises);
    abilitiesCache = results.filter(r => r !== null) as Array<{ english: string; korean: string }>;
    isCacheReady.abilities = true;
    console.log(`Abilities cache built: ${abilitiesCache.length} entries`);
    return abilitiesCache;
  } catch (error) {
    console.error('Failed to fetch abilities:', error);
    return [];
  }
};

// Fetch all moves
export const fetchAllMoves = async (): Promise<Array<{ english: string; korean: string }>> => {
  if (movesCache.length > 0) return movesCache;

  try {
    const response = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
    const data = await response.json();

    const promises = data.results.slice(0, 500).map(async (move: any) => {
      try {
        const moveResponse = await fetch(move.url);
        const moveData = await moveResponse.json();

        const englishName = moveData.names.find((n: any) => n.language.name === 'en');
        const koreanName = moveData.names.find((n: any) => n.language.name === 'ko');

        if (englishName && koreanName) {
          return { english: englishName.name, korean: koreanName.name };
        }
      } catch (error) {
        console.error(`Failed to fetch move: ${move.name}`, error);
      }
      return null;
    });

    const results = await Promise.all(promises);
    movesCache = results.filter(r => r !== null) as Array<{ english: string; korean: string }>;
    isCacheReady.moves = true;
    console.log(`Moves cache built: ${movesCache.length} entries`);
    return movesCache;
  } catch (error) {
    console.error('Failed to fetch moves:', error);
    return [];
  }
};

// Get item suggestions
export const getItemSuggestions = (input: string, limit: number = 10): string[] => {
  if (!input || input.length < 2) return [];

  const normalized = input.toLowerCase().trim();
  const suggestions: Set<string> = new Set();
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(input);

  itemsCache.forEach(item => {
    if (hasKorean) {
      if (item.korean.includes(input)) {
        suggestions.add(`${item.korean} → ${item.english}`);
      }
    } else {
      if (item.english.toLowerCase().includes(normalized)) {
        suggestions.add(item.english);
      }
    }
  });

  return Array.from(suggestions).slice(0, limit);
};

// Get ability suggestions
export const getAbilitySuggestions = (input: string, limit: number = 10): string[] => {
  if (!input || input.length < 2) return [];

  const normalized = input.toLowerCase().trim();
  const suggestions: Set<string> = new Set();
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(input);

  abilitiesCache.forEach(ability => {
    if (hasKorean) {
      if (ability.korean.includes(input)) {
        suggestions.add(`${ability.korean} → ${ability.english}`);
      }
    } else {
      if (ability.english.toLowerCase().includes(normalized)) {
        suggestions.add(ability.english);
      }
    }
  });

  return Array.from(suggestions).slice(0, limit);
};

// Get move suggestions
export const getMoveSuggestions = (input: string, limit: number = 10): string[] => {
  if (!input || input.length < 2) return [];

  const normalized = input.toLowerCase().trim();
  const suggestions: Set<string> = new Set();
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(input);

  movesCache.forEach(move => {
    if (hasKorean) {
      if (move.korean.includes(input)) {
        suggestions.add(`${move.korean} → ${move.english}`);
      }
    } else {
      if (move.english.toLowerCase().includes(normalized)) {
        suggestions.add(move.english);
      }
    }
  });

  return Array.from(suggestions).slice(0, limit);
};

// Translate Korean to English
export const translateItemKoreanToEnglish = (korean: string): string => {
  const item = itemsCache.find(i => i.korean === korean);
  return item ? item.english : korean;
};

export const translateAbilityKoreanToEnglish = (korean: string): string => {
  const ability = abilitiesCache.find(a => a.korean === korean);
  return ability ? ability.english : korean;
};

export const translateMoveKoreanToEnglish = (korean: string): string => {
  const move = movesCache.find(m => m.korean === korean);
  return move ? move.english : korean;
};

// Preload caches
if (typeof window !== 'undefined') {
  fetchAllItems().catch(console.error);
  fetchAllAbilities().catch(console.error);
  fetchAllMoves().catch(console.error);
}
