import { useState, useCallback } from "react";
import { createEmptyGrid, Feedback } from "@/utils/gameUtils";

interface UseGameStateProps {
  initialScore?: number;
  initialAttempts?: number;
}

export const useGameState = ({
  initialScore = 0,
  initialAttempts = 3,
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

  const toggleStep = useCallback((row: number, col: number) => {
    setGrid((prev) =>
      prev.map((r, i) =>
        i === row ? r.map((s, j) => (j === col ? !s : s)) : r
      )
    );
  }, []);

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid());
    setFeedbackGrid(null);
  }, []);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setFeedbackGrid(null);
    setGameWon(false);
    setGameOver(false);
    setAttemptsLeft(initialAttempts);
    setClaimedCorrectSteps(createEmptyGrid());
  }, [initialAttempts]);

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
