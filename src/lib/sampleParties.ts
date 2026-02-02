import { Party } from './types';

export const sampleParties: Party[] = [
  {
    id: 'sample-1',
    name: '공격형 파티',
    pokemon: [
      {
        id: 'garchomp-1',
        species: 'Garchomp',
        level: 100,
        ability: 'Rough Skin',
        item: 'Life Orb',
        nature: 'Jolly',
        evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Earthquake', 'Dragon Claw', 'Stone Edge', 'Swords Dance'],
        teraType: 'Ground'
      },
      {
        id: 'dragapult-1',
        species: 'Dragapult',
        level: 100,
        ability: 'Infiltrator',
        item: 'Choice Specs',
        nature: 'Timid',
        evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Draco Meteor', 'Shadow Ball', 'Flamethrower', 'U-turn'],
        teraType: 'Ghost'
      },
      {
        id: 'kingambit-1',
        species: 'Kingambit',
        level: 100,
        ability: 'Supreme Overlord',
        item: 'Black Glasses',
        nature: 'Adamant',
        evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Kowtow Cleave', 'Iron Head', 'Sucker Punch', 'Swords Dance'],
        teraType: 'Dark'
      },
      {
        id: 'iron-valiant-1',
        species: 'Iron Valiant',
        level: 100,
        ability: 'Quark Drive',
        item: 'Booster Energy',
        nature: 'Jolly',
        evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Close Combat', 'Spirit Break', 'Knock Off', 'Swords Dance'],
        teraType: 'Fighting'
      },
      {
        id: 'roaring-moon-1',
        species: 'Roaring Moon',
        level: 100,
        ability: 'Protosynthesis',
        item: 'Choice Band',
        nature: 'Jolly',
        evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Outrage', 'Knock Off', 'Earthquake', 'U-turn'],
        teraType: 'Dragon'
      },
      {
        id: 'chien-pao-1',
        species: 'Chien-Pao',
        level: 100,
        ability: 'Sword of Ruin',
        item: 'Focus Sash',
        nature: 'Jolly',
        evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Ice Spinner', 'Crunch', 'Sacred Sword', 'Swords Dance'],
        teraType: 'Ice'
      }
    ]
  },
  {
    id: 'sample-2',
    name: '밸런스 파티',
    pokemon: [
      {
        id: 'great-tusk-1',
        species: 'Great Tusk',
        level: 100,
        ability: 'Protosynthesis',
        item: 'Leftovers',
        nature: 'Jolly',
        evs: { hp: 252, atk: 4, def: 0, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Earthquake', 'Ice Spinner', 'Rapid Spin', 'Stealth Rock'],
        teraType: 'Ground'
      },
      {
        id: 'gholdengo-1',
        species: 'Gholdengo',
        level: 100,
        ability: 'Good as Gold',
        item: 'Air Balloon',
        nature: 'Timid',
        evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Make It Rain', 'Shadow Ball', 'Recover', 'Nasty Plot'],
        teraType: 'Steel'
      },
      {
        id: 'toxapex-1',
        species: 'Toxapex',
        level: 100,
        ability: 'Regenerator',
        item: 'Black Sludge',
        nature: 'Calm',
        evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Scald', 'Toxic', 'Recover', 'Haze'],
        teraType: 'Water'
      },
      {
        id: 'landorus-therian-1',
        species: 'Landorus-Therian',
        level: 100,
        ability: 'Intimidate',
        item: 'Rocky Helmet',
        nature: 'Impish',
        evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Earthquake', 'U-turn', 'Stealth Rock', 'Defog'],
        teraType: 'Flying'
      },
      {
        id: 'iron-moth-1',
        species: 'Iron Moth',
        level: 100,
        ability: 'Quark Drive',
        item: 'Booster Energy',
        nature: 'Timid',
        evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Fiery Dance', 'Sludge Wave', 'Energy Ball', 'Morning Sun'],
        teraType: 'Fire'
      },
      {
        id: 'clodsire-1',
        species: 'Clodsire',
        level: 100,
        ability: 'Water Absorb',
        item: 'Leftovers',
        nature: 'Careful',
        evs: { hp: 252, atk: 4, def: 0, spa: 0, spd: 252, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Earthquake', 'Poison Jab', 'Recover', 'Toxic Spikes'],
        teraType: 'Poison'
      }
    ]
  },
  {
    id: 'sample-3',
    name: '스태킹 파티',
    pokemon: [
      {
        id: 'iron-treads-1',
        species: 'Iron Treads',
        level: 100,
        ability: 'Quark Drive',
        item: 'Booster Energy',
        nature: 'Jolly',
        evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Earthquake', 'Iron Head', 'Ice Spinner', 'Stealth Rock'],
        teraType: 'Ground'
      },
      {
        id: 'dragonite-1',
        species: 'Dragonite',
        level: 100,
        ability: 'Multiscale',
        item: 'Heavy-Duty Boots',
        nature: 'Adamant',
        evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Extreme Speed', 'Dragon Claw', 'Earthquake', 'Dragon Dance'],
        teraType: 'Normal'
      },
      {
        id: 'skeledirge-1',
        species: 'Skeledirge',
        level: 100,
        ability: 'Unaware',
        item: 'Heavy-Duty Boots',
        nature: 'Calm',
        evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Torch Song', 'Shadow Ball', 'Slack Off', 'Will-O-Wisp'],
        teraType: 'Fire'
      },
      {
        id: 'corviknight-1',
        species: 'Corviknight',
        level: 100,
        ability: 'Pressure',
        item: 'Leftovers',
        nature: 'Impish',
        evs: { hp: 252, atk: 0, def: 168, spa: 0, spd: 88, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Brave Bird', 'Roost', 'Defog', 'U-turn'],
        teraType: 'Flying'
      },
      {
        id: 'volcarona-1',
        species: 'Volcarona',
        level: 100,
        ability: 'Flame Body',
        item: 'Heavy-Duty Boots',
        nature: 'Timid',
        evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Quiver Dance', 'Fiery Dance', 'Bug Buzz', 'Giga Drain'],
        teraType: 'Fire'
      },
      {
        id: 'ting-lu-1',
        species: 'Ting-Lu',
        level: 100,
        ability: 'Vessel of Ruin',
        item: 'Leftovers',
        nature: 'Careful',
        evs: { hp: 252, atk: 4, def: 0, spa: 0, spd: 252, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ['Earthquake', 'Heavy Slam', 'Stealth Rock', 'Whirlwind'],
        teraType: 'Dark'
      }
    ]
  },
  {
    id: 'sample-4',
    name: '트릭룸 파티',
    pokemon: [
      {
        id: 'cresselia-1',
        species: 'Cresselia',
        level: 100,
        ability: 'Levitate',
        item: 'Light Clay',
        nature: 'Bold',
        evs: { hp: 252, atk: 0, def: 252, spa: 4, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 0 },
        moves: ['Trick Room', 'Lunar Dance', 'Light Screen', 'Reflect'],
        teraType: 'Psychic'
      },
      {
        id: 'torkoal-1',
        species: 'Torkoal',
        level: 100,
        ability: 'Drought',
        item: 'Heat Rock',
        nature: 'Quiet',
        evs: { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 0 },
        moves: ['Eruption', 'Fire Blast', 'Solar Beam', 'Earth Power'],
        teraType: 'Fire'
      },
      {
        id: 'stakataka-1',
        species: 'Stakataka',
        level: 100,
        ability: 'Beast Boost',
        item: 'Weakness Policy',
        nature: 'Brave',
        evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 0 },
        moves: ['Gyro Ball', 'Stone Edge', 'Earthquake', 'Trick Room'],
        teraType: 'Steel'
      },
      {
        id: 'marowak-alola-1',
        species: 'Marowak-Alola',
        level: 100,
        ability: 'Rock Head',
        item: 'Thick Club',
        nature: 'Brave',
        evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 0 },
        moves: ['Flare Blitz', 'Poltergeist', 'Bonemerang', 'Swords Dance'],
        teraType: 'Fire'
      },
      {
        id: 'amoonguss-1',
        species: 'Amoonguss',
        level: 100,
        ability: 'Regenerator',
        item: 'Rocky Helmet',
        nature: 'Relaxed',
        evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 0 },
        moves: ['Spore', 'Giga Drain', 'Sludge Bomb', 'Foul Play'],
        teraType: 'Water'
      },
      {
        id: 'rhyperior-1',
        species: 'Rhyperior',
        level: 100,
        ability: 'Solid Rock',
        item: 'Assault Vest',
        nature: 'Brave',
        evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 0 },
        moves: ['Earthquake', 'Rock Blast', 'Ice Punch', 'Megahorn'],
        teraType: 'Ground'
      }
    ]
  }
];
