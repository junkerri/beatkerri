/**
 * Streak tracking utilities for Beatdle daily challenges
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  totalPlays: number;
  wins: number;
  perfectSolves: number;
  averageScore: number;
  playHistory: PlayRecord[];
}

export interface PlayRecord {
  date: string;
  beatNumber: number;
  won: boolean;
  score: number;
  attempts: number;
  isPerfect: boolean;
}

const STREAK_STORAGE_KEY = "beatkerri_streak_data";

/**
 * Get the current streak data from localStorage
 */
export const getStreakData = (): StreakData => {
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure all required properties exist
      return {
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastPlayedDate: data.lastPlayedDate || null,
        totalPlays: data.totalPlays || 0,
        wins: data.wins || 0,
        perfectSolves: data.perfectSolves || 0,
        averageScore: data.averageScore || 0,
        playHistory: data.playHistory || [],
      };
    }
  } catch (error) {
    console.error("Error loading streak data:", error);
  }

  // Return default data if nothing stored or error occurred
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    totalPlays: 0,
    wins: 0,
    perfectSolves: 0,
    averageScore: 0,
    playHistory: [],
  };
};

/**
 * Save streak data to localStorage
 */
export const saveStreakData = (streakData: StreakData): void => {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
  } catch (error) {
    console.error("Error saving streak data:", error);
  }
};

/**
 * Update streak data when a Beatdle is completed
 */
export const updateStreakData = (
  beatNumber: number,
  won: boolean,
  score: number,
  attempts: number,
  isPerfect: boolean
): StreakData => {
  const today = new Date().toISOString().split("T")[0];
  const currentData = getStreakData();

  // Create play record
  const playRecord: PlayRecord = {
    date: today,
    beatNumber,
    won,
    score,
    attempts,
    isPerfect,
  };

  // Check if this is a consecutive day
  const isConsecutiveDay = checkConsecutiveDay(
    currentData.lastPlayedDate,
    today
  );

  // Update streak
  let newCurrentStreak = currentData.currentStreak;
  if (won) {
    if (isConsecutiveDay) {
      newCurrentStreak += 1;
    } else {
      newCurrentStreak = 1; // Start new streak
    }
  } else {
    newCurrentStreak = 0; // Streak broken
  }

  // Update statistics
  const newTotalPlays = currentData.totalPlays + 1;
  const newWins = currentData.wins + (won ? 1 : 0);
  const newPerfectSolves = currentData.perfectSolves + (isPerfect ? 1 : 0);
  const newTotalScore =
    currentData.averageScore * currentData.totalPlays + score;
  const newAverageScore = newTotalScore / newTotalPlays;

  // Update play history (keep last 100 plays)
  const newPlayHistory = [playRecord, ...currentData.playHistory].slice(0, 100);

  const updatedData: StreakData = {
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(currentData.longestStreak, newCurrentStreak),
    lastPlayedDate: today,
    totalPlays: newTotalPlays,
    wins: newWins,
    perfectSolves: newPerfectSolves,
    averageScore: Math.round(newAverageScore * 100) / 100, // Round to 2 decimal places
    playHistory: newPlayHistory,
  };

  // Save updated data
  saveStreakData(updatedData);

  return updatedData;
};

/**
 * Check if today is consecutive to the last played date
 */
const checkConsecutiveDay = (
  lastPlayedDate: string | null,
  today: string
): boolean => {
  if (!lastPlayedDate) return false;

  const lastDate = new Date(lastPlayedDate);
  const todayDate = new Date(today);
  const timeDiff = todayDate.getTime() - lastDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // Consecutive if exactly 1 day apart
  return daysDiff === 1;
};

/**
 * Get streak status for display
 */
export const getStreakStatus = (): {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  daysUntilBreak: number;
} => {
  const data = getStreakData();
  const today = new Date().toISOString().split("T")[0];

  // Check if streak is still active (played today or yesterday)
  let isActive = false;
  let daysUntilBreak = 0;

  if (data.lastPlayedDate) {
    const lastDate = new Date(data.lastPlayedDate);
    const todayDate = new Date(today);
    const timeDiff = todayDate.getTime() - lastDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Played today - streak is active
      isActive = true;
      daysUntilBreak = 0;
    } else if (daysDiff === 1) {
      // Played yesterday - streak still active but at risk
      isActive = true;
      daysUntilBreak = 1;
    } else {
      // More than 1 day ago - streak is broken
      isActive = false;
      daysUntilBreak = 0;
    }
  }

  return {
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    isActive,
    daysUntilBreak,
  };
};

/**
 * Get win rate and other statistics
 */
export const getStreakStats = (): {
  winRate: number;
  perfectRate: number;
  averageScore: number;
  totalPlays: number;
  totalWins: number;
  totalPerfects: number;
} => {
  const data = getStreakData();

  return {
    winRate:
      data.totalPlays > 0 ? Math.round((data.wins / data.totalPlays) * 100) : 0,
    perfectRate:
      data.totalPlays > 0
        ? Math.round((data.perfectSolves / data.totalPlays) * 100)
        : 0,
    averageScore: data.averageScore,
    totalPlays: data.totalPlays,
    totalWins: data.wins,
    totalPerfects: data.perfectSolves,
  };
};
