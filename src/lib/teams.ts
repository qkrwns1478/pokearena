// lib/teams.ts
import { Team } from '@pkmn/sets';
import { Dex } from '@pkmn/dex';
import { ITeam } from '@/types';

const STORAGE_KEY = 'pokearena_saved_teams';

// 샘플 팀 (테스트용)
const SAMPLE_TEAM = `
Garchomp @ Choice Scarf
Ability: Rough Skin
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Outrage
- Iron Head
- Dragon Claw

Flutter Mane @ Choice Specs
Ability: Protosynthesis
Tera Type: Fairy
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Moonblast
- Shadow Ball
- Psyshock
- Thunderbolt
`;

export const TeamManager = {
  // 팀 저장
  saveTeam: (name: string, paste: string): ITeam => {
    // 유효성 검사: 파싱 가능한지 확인
    const team = Team.unpack(Team.import(paste)?.pack() || '', Dex);
    if (!team) throw new Error('Invalid Showdown Format');

    const newTeam: ITeam = {
      id: crypto.randomUUID(),
      name,
      format: 'gen9ou', // 기본값
      packedTeam: team.pack(),
      preview: team.team.map(p => p.species), // 아이콘용 포켓몬 이름 추출
    };

    const saved = TeamManager.getTeams();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, newTeam]));
    return newTeam;
  },

  // 팀 목록 불러오기
  getTeams: (): ITeam[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // 샘플 팀 로드 (초기 실행용)
  loadSample: () => {
    const existing = TeamManager.getTeams();
    if (existing.length === 0) {
      TeamManager.saveTeam('Sample Team A', SAMPLE_TEAM);
      TeamManager.saveTeam('Sample Team B', SAMPLE_TEAM);
    }
  }
};