import { Party } from './types';

const STORAGE_KEY = 'pokearena_parties';

export const saveParty = (party: Party): void => {
  try {
    const parties = getAllParties();
    const existingIndex = parties.findIndex(p => p.id === party.id);
    
    if (existingIndex >= 0) {
      parties[existingIndex] = party;
    } else {
      parties.push(party);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
  } catch (error) {
    console.error('Failed to save party:', error);
  }
};

export const getAllParties = (): Party[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load parties:', error);
    return [];
  }
};

export const getParty = (id: string): Party | null => {
  const parties = getAllParties();
  return parties.find(p => p.id === id) || null;
};

export const deleteParty = (id: string): void => {
  try {
    const parties = getAllParties().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
  } catch (error) {
    console.error('Failed to delete party:', error);
  }
};
