import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ITeam } from '@/lib/types';

interface TeamStore {
  teams: ITeam[];
  selectedP1Team: ITeam | null;
  selectedP2Team: ITeam | null;
  addTeam: (team: ITeam) => void;
  removeTeam: (id: string) => void;
  selectP1Team: (team: ITeam | null) => void;
  selectP2Team: (team: ITeam | null) => void;
  getTeams: () => ITeam[];
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      selectedP1Team: null,
      selectedP2Team: null,
      addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
      removeTeam: (id) =>
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== id),
        })),
      selectP1Team: (team) => set({ selectedP1Team: team }),
      selectP2Team: (team) => set({ selectedP2Team: team }),
      getTeams: () => get().teams,
    }),
    {
      name: 'saved_teams',
    }
  )
);
