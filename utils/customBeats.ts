// Custom beats management system
export interface CustomBeat {
  beatNumber: number;
  date: string; // YYYY-MM-DD format
  grid: boolean[][];
  bpm: number;
  description?: string;
}

// In-memory storage for custom beats (in production, this would be a database)
let customBeats: CustomBeat[] = [];

// Load custom beats from localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('beatkerri_custom_beats');
    if (stored) {
      customBeats = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom beats:', error);
  }
}

// Save custom beats to localStorage
const saveCustomBeats = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('beatkerri_custom_beats', JSON.stringify(customBeats));
    } catch (error) {
      console.error('Failed to save custom beats:', error);
    }
  }
};

// Get custom beat for a specific date
export const getCustomBeat = (date: string): CustomBeat | null => {
  return customBeats.find(beat => beat.date === date) || null;
};

// Add a custom beat
export const addCustomBeat = (beat: CustomBeat): void => {
  // Remove existing beat for the same date if it exists
  customBeats = customBeats.filter(b => b.date !== beat.date);
  
  // Add the new beat
  customBeats.push(beat);
  
  // Save to localStorage
  saveCustomBeats();
};

// Remove a custom beat
export const removeCustomBeat = (date: string): void => {
  customBeats = customBeats.filter(b => b.date !== date);
  saveCustomBeats();
};

// Get all custom beats
export const getAllCustomBeats = (): CustomBeat[] => {
  return [...customBeats];
};

// Check if a date has a custom beat
export const hasCustomBeat = (date: string): boolean => {
  return customBeats.some(beat => beat.date === date);
};

// Get beat for a specific date (custom or generated)
export const getBeatForDate = (date: string, generatedBeat: boolean[][], generatedBpm: number): { grid: boolean[][], bpm: number, isCustom: boolean } => {
  const customBeat = getCustomBeat(date);
  
  if (customBeat) {
    return {
      grid: customBeat.grid,
      bpm: customBeat.bpm,
      isCustom: true
    };
  }
  
  return {
    grid: generatedBeat,
    bpm: generatedBpm,
    isCustom: false
  };
}; 