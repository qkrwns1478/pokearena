import { useEffect } from 'react';
import { useTeamStore } from '@/store/team-store';
import { parseShowdownTeam } from '@/lib/team-parser';
import { sampleTeams } from '@/lib/sample-teams';

const INIT_FLAG_KEY = 'pokearena_samples_initialized';

export function useInitSampleTeams() {
  const { teams, addTeam } = useTeamStore();

  useEffect(() => {
    // Check if already initialized
    const alreadyInitialized = localStorage.getItem(INIT_FLAG_KEY);
    
    // Only initialize if never done before AND no teams exist
    if (alreadyInitialized || teams.length > 0) {
      return;
    }

    console.log('Initializing sample teams...');
    
    sampleTeams.forEach((sampleTeam) => {
      try {
        const team = parseShowdownTeam(
          sampleTeam.team,
          sampleTeam.name,
          sampleTeam.format
        );
        addTeam(team);
      } catch (error) {
        console.error(`Failed to initialize team ${sampleTeam.name}:`, error);
      }
    });

    // Mark as initialized
    localStorage.setItem(INIT_FLAG_KEY, 'true');
    console.log('Sample teams initialized!');
  }, [teams.length, addTeam]);
}
