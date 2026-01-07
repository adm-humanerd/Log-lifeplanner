import { Season, EnergyState, DayAnalysis, UserProfile } from '../types';
import { getMonth, getDate, getHours } from 'date-fns';

/**
 * NATURE'S ALGORITHM (Simplified for MVP)
 * 
 * Instead of complex celestial mechanics, we map time to seasonal archetypes.
 * 
 * Spring (Feb, Mar, Apr): Growth, Beginning, Speed
 * Summer (May, Jun, Jul): Fire, Visibility, Expansion
 * Autumn (Aug, Sep, Oct): Metal, Structure, Cutting
 * Winter (Nov, Dec, Jan): Water, Wisdom, Rest, Planning
 */

const getSeasonFromMonth = (monthIndex: number): Season => {
  // Month is 0-indexed (0 = Jan)
  if (monthIndex >= 1 && monthIndex <= 3) return Season.Spring;
  if (monthIndex >= 4 && monthIndex <= 6) return Season.Summer;
  if (monthIndex >= 7 && monthIndex <= 9) return Season.Autumn;
  return Season.Winter;
};

// Generates the daily "Whisper"
export const analyzeDay = (date: Date, user: UserProfile): DayAnalysis => {
  const currentMonth = getMonth(date);
  const currentSeason = getSeasonFromMonth(currentMonth);
  
  // Parse birth month to find "Core Nature" (simulating Day Master/Month Branch interaction)
  const birthDateObj = new Date(user.birthDate);
  const birthSeason = getSeasonFromMonth(getMonth(birthDateObj));

  let whisper = "";
  let keyword = "";
  let advice = "";

  // Interaction Logic: Current Season vs Birth Season (The "Flow")
  if (currentSeason === birthSeason) {
    // Identity Season: Strong energy, confidence
    whisper = "The current flows with you today. Trust your intuition and move boldly.";
    keyword = "Resonance";
    advice = "Great day for major decisions.";
  } else if (
    (birthSeason === Season.Spring && currentSeason === Season.Autumn) ||
    (birthSeason === Season.Autumn && currentSeason === Season.Spring) ||
    (birthSeason === Season.Summer && currentSeason === Season.Winter) ||
    (birthSeason === Season.Winter && currentSeason === Season.Summer)
  ) {
    // Opposing Season: Clash/Change/Movement
    whisper = "The wind changes direction. Adaptability is your greatest asset today.";
    keyword = "Adaptation";
    advice = "Expect the unexpected; stay flexible.";
  } else if (
    (birthSeason === Season.Winter && currentSeason === Season.Spring) ||
    (birthSeason === Season.Spring && currentSeason === Season.Summer)
  ) {
    // Feeding Season: Support/Learning
    whisper = "Energy gathers naturally. It is a good time to learn and absorb.";
    keyword = "Input";
    advice = "Focus on preparation and gathering resources.";
  } else {
    // Draining Season: Output/Performance
    whisper = "It is a time of expression. Show your work, but manage your energy.";
    keyword = "Output";
    advice = "Focus on execution rather than planning.";
  }

  return {
    whisper,
    energy: {
      season: currentSeason,
      intensity: 7, // Simulated intensity
      keyword,
      description: `We are currently in the phase of ${currentSeason}.`,
      advice
    }
  };
};

// Generates the "Nudge" for a specific task
export const getNudgeForTask = (taskContent: string, date: Date): string => {
  const season = getSeasonFromMonth(getMonth(date));
  const lowerTask = taskContent.toLowerCase();

  // Keyword analysis to match task type with season
  const isCommunication = lowerTask.includes('call') || lowerTask.includes('email') || lowerTask.includes('meet') || lowerTask.includes('propose');
  const isCreative = lowerTask.includes('write') || lowerTask.includes('design') || lowerTask.includes('brainstorm');
  const isAdmin = lowerTask.includes('pay') || lowerTask.includes('organize') || lowerTask.includes('clean') || lowerTask.includes('review');

  switch (season) {
    case Season.Spring: // Speed, Start
      if (isCreative) return "Tip: Don't overthink. Just start the draft.";
      if (isAdmin) return "Tip: Do it quickly to clear mental space.";
      return "Tip: Focus on momentum today.";
    
    case Season.Summer: // Visibility, Passion
      if (isCommunication) return "Tip: Great timing. Be bold in your request.";
      if (isAdmin) return "Tip: Handle this early before energy scatters.";
      return "Tip: Energy is high; tackle the hardest part now.";

    case Season.Autumn: // Structure, Pruning
      if (isCreative) return "Tip: Focus on editing rather than creating new.";
      if (isAdmin) return "Tip: Perfect timing for organization.";
      if (isCommunication) return "Tip: Be concise and clear.";
      return "Tip: Finish what you started.";

    case Season.Winter: // Rest, Planning
      if (isCommunication) return "Tip: Listen more than you speak.";
      if (isCreative) return "Tip: Deep work favored. Isolate yourself.";
      if (lowerTask.includes('launch') || lowerTask.includes('start')) return "Tip: Is the plan fully ready? Review once more.";
      return "Tip: Conserve energy. Focus on quality.";
      
    default:
      return "Tip: Align this with your long-term goal.";
  }
};