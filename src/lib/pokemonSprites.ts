// Pokemon HOME 스타일 스프라이트 (정면, 큰 이미지)
export const getPokemonHomeSprite = (species: string): string => {
  const formattedName = formatPokemonName(species);
  return `https://play.pokemonshowdown.com/sprites/gen5/${formattedName}.png`;
};

// 포켓몬 홈 스타일 아이콘 (정적 이미지)
export const getPokemonHomeIconUrl = (species: string): string => {
  const dexNumber = getPokemonDexNumber(species);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
};

// Pokemon Showdown 애니메이션 스프라이트
export const getPokemonSpriteUrl = (species: string, shiny: boolean = false): string => {
  const formattedName = formatPokemonName(species);
  const folder = shiny ? 'ani-shiny' : 'ani';
  return `https://play.pokemonshowdown.com/sprites/${folder}/${formattedName}.gif`;
};

// 백스프라이트
export const getPokemonBackSpriteUrl = (species: string, shiny: boolean = false): string => {
  const formattedName = formatPokemonName(species);
  const folder = shiny ? 'ani-back-shiny' : 'ani-back';
  return `https://play.pokemonshowdown.com/sprites/${folder}/${formattedName}.gif`;
};

// 포켓몬 이름을 도감 번호로 변환
const getPokemonDexNumber = (species: string): number => {
  const nameToNumber: { [key: string]: number } = {
    'bulbasaur': 1, 'ivysaur': 2, 'venusaur': 3,
    'charmander': 4, 'charmeleon': 5, 'charizard': 6,
    'squirtle': 7, 'wartortle': 8, 'blastoise': 9,
    'pikachu': 25, 'raichu': 26,
    'garchomp': 445, 'dragapult': 887, 'kingambit': 983,
    'ironvaliant': 1006, 'iron valiant': 1006,
    'roaringmoon': 1005, 'roaring moon': 1005,
    'chienpao': 1002, 'chien-pao': 1002,
    'greattusk': 984, 'great tusk': 984,
    'gholdengo': 1000, 'toxapex': 748,
    'landorustherian': 645, 'landorus-therian': 645, 'landorus': 645,
    'ironmoth': 994, 'iron moth': 994,
    'clodsire': 980,
    'irontreads': 990, 'iron treads': 990,
    'dragonite': 149,
    'skeledirge': 911, 'corviknight': 823, 'volcarona': 637,
    'tinglu': 1003, 'ting-lu': 1003,
    'cresselia': 488, 'torkoal': 324,
    'stakataka': 805,
    'marowakalola': 105, 'marowak-alola': 105, 'marowak': 105,
    'amoonguss': 591, 'rhyperior': 464
  };

  const normalized = species.toLowerCase().replace(/[^a-z]/g, '');
  return nameToNumber[normalized] || nameToNumber[species.toLowerCase()] || 1;
};

// 포켓몬 이름 포맷팅
const formatPokemonName = (species: string): string => {
  return species
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

export const getPokemonFallbackUrl = (): string => {
  return 'https://play.pokemonshowdown.com/sprites/ani/substitute.gif';
};
