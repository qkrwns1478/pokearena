// Cache for Korean-English name mappings
let koreanNameCache: { [korean: string]: string } = {};
let isLoading = false;
let isCacheReady = false;

// Build Korean name cache from PokeAPI
export const buildKoreanNameCache = async (): Promise<void> => {
  if (isCacheReady || isLoading) return;
  
  isLoading = true;
  
  try {
    // Fetch all pokemon species (limit 2000)
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000');
    const data = await response.json();
    
    // Fetch Korean names in batches
    const batchSize = 50;
    for (let i = 0; i < Math.min(500, data.results.length); i += batchSize) {
      const batch = data.results.slice(i, i + batchSize);
      
      const promises = batch.map(async (species: any) => {
        try {
          const speciesResponse = await fetch(species.url);
          const speciesData = await speciesResponse.json();
          
          // Find Korean name
          const koreanName = speciesData.names.find(
            (n: any) => n.language.name === 'ko'
          );
          
          // Find English name
          const englishName = speciesData.names.find(
            (n: any) => n.language.name === 'en'
          );
          
          if (koreanName && englishName) {
            koreanNameCache[koreanName.name] = englishName.name;
          }
        } catch (error) {
          console.error(`Failed to fetch species: ${species.name}`, error);
        }
      });
      
      await Promise.all(promises);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < Math.min(500, data.results.length)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    isCacheReady = true;
    isLoading = false;
    
    console.log(`Korean name cache built: ${Object.keys(koreanNameCache).length} entries`);
  } catch (error) {
    console.error('Failed to build Korean name cache:', error);
    isLoading = false;
  }
};

// Translate Korean pokemon name to English using cache
export const translateKoreanToEnglish = async (koreanName: string): Promise<string> => {
  // Wait for cache to be ready if it's loading
  if (isLoading) {
    let attempts = 0;
    while (isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }
  
  // Check cache first
  if (koreanNameCache[koreanName]) {
    return koreanNameCache[koreanName];
  }
  
  // If not in cache and cache is ready, return original
  if (isCacheReady) {
    console.warn(`Korean name not found in cache: ${koreanName}`);
    return koreanName;
  }
  
  // If cache is not ready, try direct API call
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000');
    const data = await response.json();
    
    // Search through results (limited to first 200 for performance)
    for (const species of data.results.slice(0, 200)) {
      try {
        const speciesResponse = await fetch(species.url);
        const speciesData = await speciesResponse.json();
        
        const koreanNameEntry = speciesData.names.find(
          (n: any) => n.language.name === 'ko' && n.name === koreanName
        );
        
        if (koreanNameEntry) {
          const englishName = speciesData.names.find(
            (n: any) => n.language.name === 'en'
          );
          
          if (englishName) {
            // Cache it for future use
            koreanNameCache[koreanName] = englishName.name;
            return englishName.name;
          }
        }
      } catch (error) {
        // Continue searching
      }
    }
  } catch (error) {
    console.error('Korean translation failed:', error);
  }
  
  // Return original if not found
  return koreanName;
};

// Check if string contains Korean characters
export const containsKorean = (text: string): boolean => {
  return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
};

// Get Korean suggestions from cache
export const getKoreanSuggestions = (input: string, limit: number = 10): Array<{ korean: string; english: string }> => {
  if (!containsKorean(input)) {
    return [];
  }
  
  // Wait a bit if cache is still loading
  if (Object.keys(koreanNameCache).length === 0) {
    return [];
  }
  
  const suggestions: Array<{ korean: string; english: string }> = [];
  
  for (const [korean, english] of Object.entries(koreanNameCache)) {
    if (korean.includes(input)) {
      suggestions.push({ korean, english });
      if (suggestions.length >= limit) break;
    }
  }
  
  return suggestions;
};

// Get cache status
export const getCacheStatus = () => {
  return {
    isReady: isCacheReady,
    isLoading: isLoading,
    size: Object.keys(koreanNameCache).length
  };
};

// Preload cache on module load
if (typeof window !== 'undefined') {
  // Start loading immediately but don't block
  buildKoreanNameCache().catch(console.error);
}
