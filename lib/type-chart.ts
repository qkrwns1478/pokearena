export const TYPE_CHART: { [attacker: string]: { immune?: string[], weak?: string[], strong?: string[] } } = {
  Normal: { immune: ['Ghost'] },
  Fire: { weak: ['Fire', 'Water', 'Rock', 'Dragon'], strong: ['Grass', 'Ice', 'Bug', 'Steel'] },
  Water: { weak: ['Water', 'Grass', 'Dragon'], strong: ['Fire', 'Ground', 'Rock'] },
  Electric: { immune: ['Ground'], weak: ['Electric', 'Grass', 'Dragon'], strong: ['Water', 'Flying'] },
  Grass: { weak: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'], strong: ['Water', 'Ground', 'Rock'] },
  Ice: { weak: ['Fire', 'Water', 'Ice', 'Steel'], strong: ['Grass', 'Ground', 'Flying', 'Dragon'] },
  Fighting: { immune: ['Ghost'], weak: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], strong: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'] },
  Poison: { immune: ['Steel'], weak: ['Poison', 'Ground', 'Rock', 'Ghost'], strong: ['Grass', 'Fairy'] },
  Ground: { immune: ['Flying'], weak: ['Grass', 'Bug'], strong: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'] },
  Flying: { weak: ['Electric', 'Rock', 'Steel'], strong: ['Grass', 'Fighting', 'Bug'] },
  Psychic: { immune: ['Dark'], weak: ['Psychic', 'Steel'], strong: ['Fighting', 'Poison'] },
  Bug: { weak: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'], strong: ['Grass', 'Psychic', 'Dark'] },
  Rock: { weak: ['Fighting', 'Ground', 'Steel'], strong: ['Fire', 'Ice', 'Flying', 'Bug'] },
  Ghost: { immune: ['Normal'], weak: ['Dark'], strong: ['Psychic', 'Ghost'] },
  Dragon: { immune: ['Fairy'], weak: ['Steel'], strong: ['Dragon'] },
  Dark: { weak: ['Fighting', 'Dark', 'Fairy'], strong: ['Psychic', 'Ghost'] },
  Steel: { weak: ['Fire', 'Water', 'Electric', 'Steel'], strong: ['Ice', 'Rock', 'Fairy'] },
  Fairy: { weak: ['Fire', 'Poison', 'Steel'], strong: ['Fighting', 'Dragon', 'Dark'] },
};

export function getEffectiveness(moveType: string, defenderType: string): number {
  const chart = TYPE_CHART[moveType];
  if (!chart) return 1;
  
  if (chart.immune?.includes(defenderType)) return 0;
  if (chart.strong?.includes(defenderType)) return 2;
  if (chart.weak?.includes(defenderType)) return 0.5;
  
  return 1;
}
