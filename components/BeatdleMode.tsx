"use client";

import { useState, useEffect } from "react";
import seedrandom from "seedrandom";
import { GameLayout } from "@/components/GameLayout";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";
import { createEmptyGrid, PlayMode } from "@/utils/gameUtils";
import { Headphones, Clock, Share2 } from "lucide-react";
import toast from "react-hot-toast";

const getTodayBeatNumber = () => {
  const epoch = new Date("2024-01-01");
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays + 1; // start from 1
};

const getDailyBPM = (beatNumber: number) => {
  const rng = seedrandom(`BPM${beatNumber}`);
  return 70 + Math.floor(rng() * 41); // 70–110
};

const getTimeUntilNextBeat = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

const createDailyPattern = (beatNumber: number) => {
  const rng = seedrandom(`DailyBeat${beatNumber}`);
  const grid = createEmptyGrid();

  const activeRows = [0, 1, 2];
  const targetNotes = 8 + Math.floor(rng() * 8); // 8–15 notes

  let count = 0;
  while (count < targetNotes) {
    const row = activeRows[Math.floor(rng() * activeRows.length)];
    const col = Math.floor(rng() * 16);
    if (!grid[row][col]) {
      grid[row][col] = true;
      count++;
    }
  }

  return grid;
};

// Add attempt history for Wordle-style sharing
type Attempt = {
  grid: boolean[][];
  feedback: ("correct" | "incorrect" | null)[][];
};

export default function BeatdleMode() {
  const beatNumber = getTodayBeatNumber();
  const bpm = getDailyBPM(beatNumber);
  const targetGrid = createDailyPattern(beatNumber);

  const [mode, setMode] = useState<PlayMode>("recreate");
  const [isLooping, setIsLooping] = useState(true);
  const [attemptHistory, setAttemptHistory] = useState<Attempt[]>([]);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [isTargetPlaying, setIsTargetPlaying] = useState(false);

  // Additional state for Beatdle mode
  const [beatsCompleted, setBeatsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [perfectSolves, setPerfectSolves] = useState(0);

  // Use shared hooks
  const {
    activeStep,
    isPlaying,
    setIsPlaying,
    playPattern: playPatternAudio,
    stopPlayback: stopPlaybackAudio,
    playStep,
  } = useAudioPlayback({ bpm, isLooping });

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
  } = useGameState();

  useEffect(() => {
    const progress = localStorage.getItem("beatdle_progress");
    if (progress) {
      const parsed = JSON.parse(progress);
      if (
        parsed.beatNumber === beatNumber &&
        (parsed.gameOver || parsed.gameWon)
      ) {
        setAlreadyPlayed(true);
        // Load saved score and stats
        if (parsed.score !== undefined) setScore(parsed.score);
        if (parsed.highestScore !== undefined)
          setHighestScore(parsed.highestScore);
        if (parsed.beatsCompleted !== undefined)
          setBeatsCompleted(parsed.beatsCompleted);
        if (parsed.totalAttempts !== undefined)
          setTotalAttempts(parsed.totalAttempts);
        if (parsed.perfectSolves !== undefined)
          setPerfectSolves(parsed.perfectSolves);
        if (parsed.gameWon) setGameWon(true);
        if (parsed.gameOver) setGameOver(true);
      }
    }
  }, [
    beatNumber,
    setScore,
    setHighestScore,
    setBeatsCompleted,
    setTotalAttempts,
    setPerfectSolves,
    setGameWon,
    setGameOver,
  ]);

  const togglePlay = async () => {
    if (isPlaying) {
      stopPlaybackAudio();
      setIsPlaying(false);
    } else {
      if (mode === "target") {
        await playPatternAudio(targetGrid);
      } else {
        await playPatternAudio(grid);
      }
      setIsPlaying(true);
    }
  };

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate") {
      toggleStepGrid(row, col);
      await playStep(row);
    }
  };

  const handleTabClick = (tab: PlayMode) => {
    setMode(tab);
    stopPlaybackAudio();
    if (tab === "target") {
      playPatternAudio(targetGrid);
    }
  };
  const saveProgress = (
    newBeatNumber = beatNumber,
    newScore = score,
    newBeatsCompleted = beatsCompleted,
    newTotalAttempts = totalAttempts,
    newPerfectSolves = perfectSolves,
    newHighestScore = highestScore,
    newAttemptsLeft = attemptsLeft,
    newGameWon = gameWon,
    newGameOver = gameOver
  ) => {
    localStorage.setItem(
      "beatdle_progress",
      JSON.stringify({
        beatNumber: newBeatNumber,
        score: newScore,
        beatsCompleted: newBeatsCompleted,
        totalAttempts: newTotalAttempts,
        perfectSolves: newPerfectSolves,
        highestScore: newHighestScore,
        attemptsLeft: newAttemptsLeft,
        gameWon: newGameWon,
        gameOver: newGameOver,
      })
    );
  };

  // Wordle-style share logic
  function getShareRow(
    grid: boolean[][],
    feedback: ("correct" | "incorrect" | null)[][]
  ) {
    return Array(16)
      .fill(0)
      .map((_, col) => {
        const guessed = grid.some((row) => row[col]);
        if (!guessed) return "⬛";
        const correct = feedback.some((row) => row[col] === "correct");
        if (correct) return "🟩";
        const incorrect = feedback.some((row) => row[col] === "incorrect");
        if (incorrect) return "🟥";
        return "⬛";
      })
      .join("");
  }

  // Get attempt emoji for sharing
  function getAttemptEmoji(attempts: number, gameWon: boolean) {
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
  }

  // Visual squares for overlay
  function getShareText() {
    const solved = gameWon;
    const attemptsUsed = attemptHistory.length;
    const maxAttempts = 3;
    const attemptStr = solved
      ? `${attemptsUsed}/${maxAttempts}`
      : `X/${maxAttempts}`;
    const attemptEmoji = getAttemptEmoji(attemptsUsed, gameWon);
    const header = `Beatdle #${beatNumber} ${attemptStr} ${attemptEmoji} 🎧`;
    // All attempts' colored squares, each on a new line
    const rows = attemptHistory
      .map((a) => getShareRow(a.grid, a.feedback))
      .join("\n");
    return `${header}\n${rows}\nScore: ${score}\nCan you beat it?\nhttps://beatkerri.vercel.app/`;
  }

  // Share menu/modal state
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        toast.success("Results shared!");
      } catch {
        toast.error("Could not share.");
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  const submitGuess = () => {
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
    setFeedbackGrid((prev) => {
      if (!prev) return newFeedback;

      return newFeedback.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const current = newFeedback[rowIndex][colIndex];
          const previous = prev[rowIndex][colIndex];

          if (current === "correct" || previous === "correct") return "correct";
          if (current === "incorrect" || previous === "incorrect")
            return "incorrect";
          return null;
        })
      );
    });

    // Store attempt for sharing
    setAttemptHistory((prev) => [
      ...prev,
      { grid: JSON.parse(JSON.stringify(grid)), feedback: newFeedback },
    ]);

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

    if (allCorrect) {
      totalScore += 10;
      const updatedHighest = Math.max(highestScore, totalScore);
      setHighestScore(updatedHighest);

      setGameWon(true);
      setBeatsCompleted(beatsCompleted + 1);
      if (attemptsLeft === 3) {
        setPerfectSolves(perfectSolves + 1);
      }
      saveProgress(
        beatNumber,
        totalScore,
        beatsCompleted + 1,
        newTotalAttempts,
        perfectSolves + (attemptsLeft === 3 ? 1 : 0),
        updatedHighest,
        3,
        true, // gameWon
        false // gameOver
      );

      stopPlaybackAudio();

      toast.success(
        `🎉 Perfect! You recreated the beat and earned ${
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
        remaining,
        false, // gameWon
        false // gameOver
      );

      if (remaining <= 0) {
        setGameOver(true);
        stopPlaybackAudio();
        saveProgress(
          beatNumber,
          0,
          beatsCompleted,
          newTotalAttempts,
          perfectSolves,
          highestScore,
          3,
          false, // gameWon
          true // gameOver
        );

        // Removed toast notification for game over since we have overlay
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

  // Toggle Listen (Headphones) for target beat
  const toggleTargetBeat = async () => {
    if (isTargetPlaying) {
      stopPlaybackAudio();
      setIsTargetPlaying(false);
    } else {
      setIsTargetPlaying(true);
      await playPatternAudio(targetGrid, false, () =>
        setIsTargetPlaying(false)
      );
    }
  };

  // If already played, show message and block game UI
  if (alreadyPlayed) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl font-extrabold animate-pulse font-mono text-red-500">
            🕐 ALREADY PLAYED TODAY 🕐
          </div>
          <p className="text-yellow-400 font-mono text-lg">
            Final Score: {score}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTargetBeat}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
              title="Play Beat"
            >
              <Headphones size={18} className="text-white" />
              <span>Listen</span>
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
            >
              <Share2 size={18} className="text-white" />
              <span>Share Results</span>
            </button>
          </div>
          <p className="text-gray-400 font-mono text-center mt-4">
            Come back tomorrow for a new beat!
          </p>
          <p className="text-gray-500 font-mono text-center text-xs flex items-center justify-center">
            <Clock className="w-3 h-3 mr-1" />
            Next beat available in {getTimeUntilNextBeat()}
          </p>
        </div>
      </main>
    );
  }

  return (
    <GameLayout
      mode="beatdle"
      beatLabel={`Beatdle #${beatNumber} — Listen & Recreate`}
      bpm={bpm}
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
      onListenTarget={toggleTargetBeat}
      onShare={handleShare}
      isTargetPlaying={isTargetPlaying}
      showShareMenu={showShareMenu}
      onCloseShareMenu={() => setShowShareMenu(false)}
      alreadyPlayed={alreadyPlayed}
      timeUntilNextBeat={getTimeUntilNextBeat()}
      totalAttempts={attemptHistory.length}
      score={score}
      highestScore={highestScore}
    />
  );
}
