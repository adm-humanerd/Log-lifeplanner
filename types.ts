export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  location: string;
  isSetupComplete: boolean;
}

export enum Season {
  Spring = 'Spring', // Growth, Start
  Summer = 'Summer', // Passion, Expansion
  Autumn = 'Autumn', // Harvest, Organization
  Winter = 'Winter', // Rest, Planning
}

export interface EnergyState {
  season: Season;
  intensity: number; // 1-10
  keyword: string;
  description: string;
  advice: string;
}

export interface Task {
  id: string;
  content: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  nudge?: string; // The "Nature's Algorithm" advice tag
}

export interface DayAnalysis {
  whisper: string; // The daily guidance sentence
  energy: EnergyState;
}

export type ViewMode = 'day' | 'week' | 'month';