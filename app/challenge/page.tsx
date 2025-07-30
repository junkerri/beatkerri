"use client";

import { useState, useEffect, useCallback } from "react";
import seedrandom from "seedrandom";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";
import { GameLayout } from "@/components/GameLayout";
import toast from "react-hot-toast";
import "@/app/globals.css";

import {
  playButtonClick,
  playToggleClick,
  playSubmitClick,
} from "@/utils/clickSounds";
import { useSoundscapes } from "@/hooks/useSoundscapes";
import * as Tone from "tone";

export default function Home() {
  const { playVictory, playLoss, stopAllImmediately } = useSoundscapes();

  const createEmptyGrid = () =>
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(false));

  // Utility Functions
  const getUnlockedInstruments = (beatNumber: number): number[] => {
    const unlocked = [0, 1, 2]; // BD, SN, HH
    if (beatNumber >= 6) unlocked.push(6); // CL (index 6)
    if (beatNumber >= 11) unlocked.push(4); // LT (index 4)
    if (beatNumber >= 16) unlocked.push(5); // HT (index 5)
    if (beatNumber >= 21) unlocked.push(3); // OH (index 3)
    return unlocked;
  };

  const getStackRulesForBeat = (beatNumber: number) => {
    if (beatNumber <= 15) {
      return {
        maxPerColumn: 1,
        allowedCombos: [], // no stacking
      };
    }

    if (beatNumber <= 30) {
      return {
        maxPerColumn: 2,
        allowedCombos: [
          [0, 2], // BD + HH
          [0, 6], // BD + CL
          [0, 1], // BD + SN
        ],
      };
    }

    return {
      maxPerColumn: 3,
      allowedCombos: [
        [0, 2], // BD + HH
        [0, 6], // BD + CL
        [0, 1], // BD + SN
        [0, 3], // BD + OH
        [0, 2, 3], // BD + HH + OH
        [0, 1, 2], // BD + SN + HH
        [0, 1, 6], // BD + SN + CL
      ],
    };
  };

  const getBpmForBeat = (beatNumber: number): number => {
    const rng = seedrandom(`BPM${beatNumber}`);

    if (beatNumber <= 20) {
      // Randomized between 70–100, same per beat (deterministic)
      return Math.floor(rng() * (100 - 70 + 1)) + 70;
    }

    // After 20, increase up to 130
    const extra = Math.min(30, (beatNumber - 20) * 2);
    return 100 + extra;
  };

  // Attempt-based messaging functions for Challenge mode
  const getAttemptEmoji = (attempts: number, gameWon: boolean) => {
    if (!gameWon) return "💀"; // Dead emoji for X/3
    switch (attempts) {
      case 1:
        return "🎯"; // Bullseye for 1/3
      case 2:
        return "🎩"; // Hat for 2/3
      case 3:
        return "🎉"; // Party hat for 3/3
      default:
        return "💀"; // Dead emoji for X/3
    }
  };

  const getAttemptMessage = (attempts: number, gameWon: boolean) => {
    if (!gameWon) return "Better luck next time!";
    switch (attempts) {
      case 1:
        return "Perfect! You recreated the beat on the first try!";
      case 2:
        return "Good job! You recreated the beat on the second try!";
      case 3:
        return "You made it! Just in time on the third try!";
      default:
        return "Better luck next time!";
    }
  };

  const createPatternForBeat = useCallback((beatNumber: number) => {
    const grid = createEmptyGrid();
    const rng = seedrandom(`Beat${beatNumber}`);

    const allowedRows = getUnlockedInstruments(beatNumber);
    const { maxPerColumn, allowedCombos } = getStackRulesForBeat(beatNumber);

    let targetNotes = 8;

    if (beatNumber >= 6 && beatNumber <= 10) {
      targetNotes = 10;
    } else if (beatNumber >= 11 && beatNumber <= 20) {
      targetNotes = 12;
    } else if (beatNumber >= 21 && beatNumber <= 30) {
      targetNotes = 16;
    } else if (beatNumber >= 31) {
      targetNotes = 18;
    }
    console.log(
      `Beat ${beatNumber}: ${targetNotes} notes, allowedRows =`,
      allowedRows
    );

    const columnCounts = Array(16).fill(0);
    let totalNotes = 0;

    while (totalNotes < targetNotes) {
      const row = allowedRows[Math.floor(rng() * allowedRows.length)];
      const col = Math.floor(rng() * 16);

      const stackCount = columnCounts[col];

      // Skip if over column stack limit
      if (stackCount >= maxPerColumn) continue;

      // Simulate what the stack would be if we added this row
      const currentStack = grid
        .map((r, i) => (r[col] ? i : null))
        .filter((i) => i !== null);

      const simulatedStack = [...currentStack, row].sort();

      // If stacking, validate against allowedCombos
      if (simulatedStack.length > 1) {
        const isAllowed = allowedCombos.some((combo) => {
          return (
            combo.length === simulatedStack.length &&
            combo.every((val, i) => val === simulatedStack[i])
          );
        });

        if (!isAllowed) continue; // Skip if not allowed
      }

      // Passed all checks — add note
      if (!grid[row][col]) {
        grid[row][col] = true;
        columnCounts[col]++;
        totalNotes++;
      }
    }
    console.log(
      `Beat ${beatNumber}: ${totalNotes} notes, allowedRows =`,
      allowedRows
    );

    return grid;
  }, []);

  // Game state
  const [beatNumber, setBeatNumber] = useState(1);
  const [targetGrid, setTargetGrid] = useState(createPatternForBeat(1));
  const [mode, setMode] = useState<"target" | "recreate">("recreate");
  const [isTargetPlaying, setIsTargetPlaying] = useState(false);

  const [isLooping, setIsLooping] = useState(true);
  const [beatsCompleted, setBeatsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [perfectSolves, setPerfectSolves] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0); // Track attempts used for current beat

  // Use shared hooks for audio and game state
  const {
    activeStep,
    isPlaying,
    setIsPlaying,
    playPattern,
    stopPlayback,
    playStep,
    updatePattern,
  } = useAudioPlayback({ bpm: getBpmForBeat(beatNumber), isLooping });

  const {
    grid,
    feedbackGrid,
    score,
    highestScore,
    attemptsLeft,
    gameWon,
    gameOver,
    claimedCorrectSteps,
    setFeedbackGrid,
    setScore,
    setHighestScore,
    setAttemptsLeft,
    setGameWon,
    setGameOver,
    setClaimedCorrectSteps,
    toggleStep: toggleStepGrid,
    clearGrid,
  } = useGameState({
    onGridChange: updatePattern,
  });

  // Stop target beat when component unmounts
  useEffect(() => {
    return () => {
      // Force stop all audio when component unmounts
      stopPlayback();
      setIsTargetPlaying(false);
      stopAllImmediately();

      // Force stop Tone.js transport
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [stopPlayback, stopAllImmediately]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("beatkerri_progress");
    if (saved) {
      const data = JSON.parse(saved);
      setBeatNumber(data.beatNumber || 1);
      setScore(data.score || 0);
      setHighestScore(data.highestScore || 0);
      setAttemptsLeft(data.attemptsLeft ?? 3); // 👈 Restore attempts
      setTargetGrid(createPatternForBeat(data.beatNumber || 1));
    }
    // Clear the grid when component loads
    clearGrid();
  }, [
    createPatternForBeat,
    setScore,
    setHighestScore,
    setAttemptsLeft,
    clearGrid,
  ]);

  const saveProgress = (
    newBeatNumber = beatNumber,
    newScore = score,
    newBeatsCompleted = beatsCompleted,
    newTotalAttempts = totalAttempts,
    newPerfectSolves = perfectSolves,
    newHighestScore = highestScore,
    newAttemptsLeft = attemptsLeft // 👈 Add this
  ) => {
    localStorage.setItem(
      "beatkerri_progress",
      JSON.stringify({
        beatNumber: newBeatNumber,
        score: newScore,
        beatsCompleted: newBeatsCompleted,
        totalAttempts: newTotalAttempts,
        perfectSolves: newPerfectSolves,
        highestScore: newHighestScore,
        attemptsLeft: newAttemptsLeft, // 👈 Save it
      })
    );
  };

  // Audio controls
  const togglePlay = async () => {
    playButtonClick();
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
    } else {
      if (mode === "target") {
        await playTargetGrid();
      } else {
        await playGrid();
      }
      setIsPlaying(true);
    }
  };

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate" && !gameOver && !gameWon) {
      toggleStepGrid(row, col);
      await playStep(row);
    }
  };

  const playGrid = () => playPattern(grid);
  const playTargetGrid = useCallback(
    async (onComplete?: () => void) => {
      await playPattern(targetGrid);
      if (onComplete) {
        onComplete();
      }
    },
    [targetGrid, playPattern]
  );

  // Removed automatic playback of target grid on game over/won
  // Now it will only play when user clicks the Listen button

  // Cleanup soundscapes on unmount and when game state changes
  useEffect(() => {
    return () => {
      stopAllImmediately();
    };
  }, [stopAllImmediately]);

  // Stop all soundscapes when component unmounts
  useEffect(() => {
    return () => {
      stopAllImmediately();
    };
  }, [stopAllImmediately]);

  // Game logic
  const submitGuess = () => {
    playSubmitClick();
    const newFeedback = grid.map((row, rowIndex) =>
      row.map((step, colIndex) => {
        if (step) {
          if (targetGrid[rowIndex][colIndex]) {
            return "correct";
          } else {
            return "incorrect";
          }
        } else {
          return null;
        }
      })
    );
    setFeedbackGrid(newFeedback);

    let newlyCorrect = 0;
    const updatedClaimed = claimedCorrectSteps.map((row, rowIndex) =>
      row.map((claimed, colIndex) => {
        if (
          !claimed &&
          grid[rowIndex][colIndex] &&
          targetGrid[rowIndex][colIndex]
        ) {
          newlyCorrect++;
          return true;
        }
        return claimed;
      })
    );

    let pointsPerCorrect = 0;
    if (attemptsLeft === 3) pointsPerCorrect = 5;
    else if (attemptsLeft === 2) pointsPerCorrect = 3;
    else pointsPerCorrect = 1;

    let totalScore = score + newlyCorrect * pointsPerCorrect;
    const targetNoteCount = targetGrid.flat().filter(Boolean).length;
    const correctCount = grid.flat().filter((val, i) => {
      const row = Math.floor(i / 16);
      const col = i % 16;
      return val && targetGrid[row][col];
    }).length;
    const remainingNotes = targetNoteCount - correctCount;

    let allCorrect = true;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 16; col++) {
        if (grid[row][col] !== targetGrid[row][col]) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }

    const newTotalAttempts = totalAttempts + 1;
    const currentAttemptsUsed = 3 - attemptsLeft + 1; // Calculate attempts used for this beat

    if (allCorrect) {
      totalScore += 10;
      const updatedHighest = Math.max(highestScore, totalScore);
      setHighestScore(updatedHighest);

      setGameWon(true);
      setBeatsCompleted(beatsCompleted + 1);
      setAttemptsUsed(currentAttemptsUsed); // Set attempts used for this beat
      if (attemptsLeft === 3) {
        setPerfectSolves(perfectSolves + 1);
      }

      // Play victory soundscape
      playVictory("challenge", attemptsLeft === 3);

      saveProgress(
        beatNumber, // ✅ Correct here
        totalScore,
        beatsCompleted + 1,
        newTotalAttempts,
        perfectSolves + (attemptsLeft === 3 ? 1 : 0),
        updatedHighest,
        3 // reset attempts for next beat
      );

      const attemptsUsed = 3 - attemptsLeft + 1; // Calculate attempts used
      const attemptEmoji = getAttemptEmoji(attemptsUsed, true);
      const attemptMessage = getAttemptMessage(attemptsUsed, true);

      toast.success(
        `${attemptEmoji} ${attemptMessage} You earned ${
          newlyCorrect * pointsPerCorrect + 10
        } total points!`,
        {
          style: {
            background: "#22c55e",
            color: "#fff",
          },
          duration: 4000,
        }
      );
    } else {
      const remaining = attemptsLeft - 1;
      setTotalAttempts(newTotalAttempts);
      saveProgress(
        beatNumber,
        totalScore,
        beatsCompleted,
        newTotalAttempts,
        perfectSolves,
        highestScore,
        remaining // save remaining attempts
      );

      if (remaining <= 0) {
        setGameOver(true);
        setAttemptsUsed(3); // Set attempts used to 3 for game over

        // Play loss soundscape
        playLoss("challenge");

        saveProgress(
          beatNumber,
          0,
          beatsCompleted,
          newTotalAttempts,
          perfectSolves,
          highestScore,
          3 // reset to 3 for retry
        );

        const attemptEmoji = getAttemptEmoji(3, false); // 3 attempts used, didn't win
        const attemptMessage = getAttemptMessage(3, false);

        toast.error(`${attemptEmoji} ${attemptMessage}`, {
          style: {
            background: "#b91c1c",
            color: "#fff",
          },
          duration: 4000,
        });
      } else {
        setAttemptsLeft(remaining);

        toast(
          `🎯 You matched ${correctCount}/${targetNoteCount} notes (${remainingNotes} more to go). You scored ${
            newlyCorrect * pointsPerCorrect
          } points.`,
          {
            style: {
              background: "#333",
              color: "#fff",
            },
            duration: 4000,
          }
        );
      }
    }

    setClaimedCorrectSteps(updatedClaimed);
    setScore(totalScore);
  };

  const resetGame = () => {
    // Stop any playing soundscapes (victory/loss music)
    stopAllImmediately();
    setGameOver(false);
    setGameWon(false);
    setFeedbackGrid(null);
    setMode("recreate");
    setScore(0); // Reset score when retrying
    setAttemptsLeft(3); // Reset attempts to 3
    setAttemptsUsed(0); // Reset attempts used
    setClaimedCorrectSteps(createEmptyGrid());
    setTargetGrid(createPatternForBeat(beatNumber));

    clearGrid(); // Clear the user's grid
    stopPlayback();
  };

  const nextBeat = () => {
    const next = beatNumber + 1;
    // Stop any playing soundscapes (victory music)
    stopAllImmediately();
    setGameWon(false);
    setBeatNumber(next);
    setFeedbackGrid(null);
    setAttemptsLeft(3);
    setAttemptsUsed(0); // Reset attempts used for new beat
    setMode("recreate");
    // ❌ Do NOT reset score here—so it keeps accumulating
    setClaimedCorrectSteps(createEmptyGrid());
    setTargetGrid(createPatternForBeat(next));

    clearGrid(); // Clear the user's grid
    stopPlayback();
    saveProgress(
      next,
      score,
      beatsCompleted,
      totalAttempts,
      perfectSolves,
      highestScore
    );
  };

  const handleTabClick = (tab: "target" | "recreate") => {
    if (gameOver || gameWon) return;
    playToggleClick();
    setMode(tab);
    stopPlayback();
    if (tab === "target") {
      playTargetGrid();
    }
  };

  // Toggle Listen (Headphones) for target beat
  const toggleTargetBeat = async () => {
    if (isTargetPlaying) {
      // Stop the target audio
      stopPlayback();
      setIsTargetPlaying(false);
      // Wait a moment for audio to fully stop before resuming soundscape
      setTimeout(() => {
        if (gameOver) {
          playLoss("challenge");
        } else if (gameWon) {
          playVictory("challenge", attemptsLeft === 3);
        }
      }, 100);
    } else {
      // Stop any playing soundscape before playing target
      stopAllImmediately();
      setIsTargetPlaying(true);
      // Play target grid once (not looping)
      await playPattern(targetGrid, false, () => {
        setIsTargetPlaying(false);
        // Resume the appropriate soundscape after target finishes
        if (gameOver) {
          playLoss("challenge");
        } else if (gameWon) {
          playVictory("challenge", attemptsLeft === 3);
        }
      });
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-2 sm:p-4">
      <GameLayout
        mode="challenge"
        beatLabel={`Beat ${beatNumber}`}
        bpm={getBpmForBeat(beatNumber)}
        grid={grid}
        targetGrid={targetGrid}
        feedbackGrid={feedbackGrid || undefined}
        activeStep={activeStep}
        isLooping={isLooping}
        isPlaying={isPlaying}
        gameOver={gameOver}
        gameWon={gameWon}
        attemptsLeft={attemptsLeft}
        currentPlayMode={mode}
        onTogglePlayMode={handleTabClick}
        onToggleStep={toggleStep}
        onTogglePlay={togglePlay}
        onToggleLoop={() => setIsLooping(!isLooping)}
        onSubmitGuess={submitGuess}
        onClearGrid={clearGrid}
        onNextBeat={nextBeat}
        onRetry={resetGame}
        onListenTarget={toggleTargetBeat}
        isTargetPlaying={isTargetPlaying}
        score={score}
        highestScore={highestScore}
        beatsCompleted={beatsCompleted}
        perfectSolves={perfectSolves}
        totalAttempts={attemptsUsed}
      />
    </main>
  );
}
