import { useState, useCallback } from "react";
import { createEmptyGrid, Feedback } from "@/utils/gameUtils";

interface UseGameStateProps {
  initialScore?: number;
  initialAttempts?: number;
  onGridChange?: (grid: boolean[][]) => void; // New callback for real-time updates
}

export const useGameState = ({
  initialScore = 0,
  initialAttempts = 3,
  onGridChange,
}: UseGameStateProps = {}) => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [feedbackGrid, setFeedbackGrid] = useState<Feedback[][] | null>(null);
  const [score, setScore] = useState(initialScore);
  const [highestScore, setHighestScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttempts);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [claimedCorrectSteps, setClaimedCorrectSteps] = useState(
    createEmptyGrid()
  );

  const toggleStep = useCallback(
    (row: number, col: number) => {
      setGrid((prev) => {
        const newGrid = prev.map((r, i) =>
          i === row ? r.map((s, j) => (j === col ? !s : s)) : r
        );
        // Call the callback to update the pattern in real-time
        onGridChange?.(newGrid);
        return newGrid;
      });
    },
    [onGridChange]
  );

  const clearGrid = useCallback(() => {
    const emptyGrid = createEmptyGrid();
    setGrid(emptyGrid);
    setFeedbackGrid(null);
    // Call the callback to update the pattern in real-time
    onGridChange?.(emptyGrid);
  }, [onGridChange]);

  const resetGame = useCallback(() => {
    const emptyGrid = createEmptyGrid();
    setGrid(emptyGrid);
    setFeedbackGrid(null);
    setGameWon(false);
    setGameOver(false);
    setAttemptsLeft(initialAttempts);
    setClaimedCorrectSteps(createEmptyGrid());
    // Call the callback to update the pattern in real-time
    onGridChange?.(emptyGrid);
  }, [initialAttempts, onGridChange]);

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
    setHighestScore((prev) => Math.max(prev, newScore));
  }, []);

  return {
    // State
    grid,
    feedbackGrid,
    score,
    highestScore,
    attemptsLeft,
    gameWon,
    gameOver,
    claimedCorrectSteps,

    // Setters
    setGrid,
    setFeedbackGrid,
    setScore,
    setHighestScore,
    setAttemptsLeft,
    setGameWon,
    setGameOver,
    setClaimedCorrectSteps,

    // Actions
    toggleStep,
    clearGrid,
    resetGame,
    updateScore,
  };
};
