"use client";

import { useState, useEffect, useCallback } from "react";
import seedrandom from "seedrandom";
import { SequencerGrid } from "@/components/SequencerGrid";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";

import toast from "react-hot-toast";
import "@/app/globals.css";

import {
  Play,
  Square,
  Repeat,
  Trash2,
  Zap,
  Wand2,
  Crosshair,
  Headphones,
  HelpCircle,
} from "lucide-react";
import Confetti from "react-confetti";
import Link from "next/link";
import { playSubmitClick } from "@/utils/clickSounds";
import { useSoundscapes } from "@/hooks/useSoundscapes";
import * as Tone from "tone";

export default function Home() {
  const { playVictory, playLoss, stopAllImmediately } = useSoundscapes();

  // Helper functions for attempt-based messages (like Beatdle mode)
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
        return "Perfect! You nailed it on the first try!";
      case 2:
        return "Good job! You got it on the second try!";
      case 3:
        return "You made it! Just in time on the third try!";
      default:
        return "Better luck next time!";
    }
  };

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
    if (beatNumber <= 5) return 80;
    if (beatNumber <= 10) return 85;
    if (beatNumber <= 15) return 90;
    if (beatNumber <= 20) return 95;
    if (beatNumber <= 25) return 100;
    if (beatNumber <= 30) return 105;
    if (beatNumber <= 35) return 110;
    if (beatNumber <= 40) return 115;
    if (beatNumber <= 45) return 120;
    return 125;
  };

  // Game state
  const [beatNumber, setBeatNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [beatsCompleted, setBeatsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [perfectSolves, setPerfectSolves] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mode, setMode] = useState<"target" | "recreate">("target");
  const [isTargetPlaying, setIsTargetPlaying] = useState(false);

  // Use shared hooks for audio and game state
  const { activeStep, isPlaying, playPattern, stopPlayback, updatePattern } =
    useAudioPlayback({ bpm: getBpmForBeat(beatNumber), isLooping: true });

  const {
    grid,
    feedbackGrid,
    attemptsLeft,
    setAttemptsLeft,
    toggleStep: toggleStepGrid,
    clearGrid,
  } = useGameState({
    onGridChange: updatePattern,
  });

  // Generate target beat based on beat number
  const generateTargetBeat = useCallback((beatNum: number) => {
    const rng = seedrandom(`beat-${beatNum}`);
    const targetGrid = createEmptyGrid();
    const unlockedInstruments = getUnlockedInstruments(beatNum);
    const stackRules = getStackRulesForBeat(beatNum);
    // Determine number of notes based on beat number
    const totalNotes = Math.min(8 + Math.floor(beatNum / 5), 20);
    let notesPlaced = 0;

    while (notesPlaced < totalNotes) {
      const row =
        unlockedInstruments[Math.floor(rng() * unlockedInstruments.length)];
      const col = Math.floor(rng() * 16);

      // Check if we can place a note here
      if (!targetGrid[row][col]) {
        // Check stacking rules
        const notesInColumn = targetGrid.reduce(
          (count, r) => count + (r[col] ? 1 : 0),
          0
        );

        if (notesInColumn < stackRules.maxPerColumn) {
          // For basic stacking, check if combination is allowed
          if (stackRules.maxPerColumn > 1) {
            const activeNotesInColumn = targetGrid
              .map((r, i) => (r[col] ? i : -1))
              .filter((i) => i !== -1);

            const newCombination = [...activeNotesInColumn, row].sort();
            const isAllowed = stackRules.allowedCombos.some(
              (combo) =>
                combo.length === newCombination.length &&
                combo.every((note, index) => note === newCombination[index])
            );

            if (!isAllowed) continue;
          }

          targetGrid[row][col] = true;
          notesPlaced++;
        }
      }
    }

    return targetGrid;
  }, []);

  const [targetGrid, setTargetGrid] = useState<boolean[][]>(() =>
    generateTargetBeat(1)
  );

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("challenge_progress");
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setBeatNumber(progress.beatNumber || 1);
      setScore(progress.score || 0);
      setHighestScore(progress.highestScore || 0);
      setBeatsCompleted(progress.beatsCompleted || 0);
      setTotalAttempts(progress.totalAttempts || 0);
      setPerfectSolves(progress.perfectSolves || 0);

      // Generate target beat for the loaded beat number
      const newTargetGrid = generateTargetBeat(progress.beatNumber || 1);
      setTargetGrid(newTargetGrid);
    }
  }, [generateTargetBeat]);

  // Save progress to localStorage
  const saveProgress = (
    newBeatNumber = beatNumber,
    newScore = score,
    newBeatsCompleted = beatsCompleted,
    newTotalAttempts = totalAttempts,
    newPerfectSolves = perfectSolves,
    newHighestScore = highestScore,
    newAttemptsLeft = attemptsLeft
  ) => {
    const progress = {
      beatNumber: newBeatNumber,
      score: newScore,
      highestScore: newHighestScore,
      beatsCompleted: newBeatsCompleted,
      totalAttempts: newTotalAttempts,
      perfectSolves: newPerfectSolves,
      attemptsLeft: newAttemptsLeft,
    };
    localStorage.setItem("challenge_progress", JSON.stringify(progress));
  };

  // Audio controls
  const togglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      await playPattern(grid);
    }
  };

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate" && !gameOver && !gameWon) {
      toggleStepGrid(row, col);
    }
  };

  // Game logic
  const submitGuess = () => {
    if (gameOver || gameWon || mode !== "recreate") return;

    playSubmitClick();
    setTotalAttempts((prev) => prev + 1);

    // Check if grids match
    let correctNotes = 0;
    let totalNotes = 0;
    const newFeedbackGrid = createEmptyGrid();

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 16; col++) {
        if (targetGrid[row][col]) {
          totalNotes++;
          if (grid[row][col]) {
            correctNotes++;
            newFeedbackGrid[row][col] = "correct";
          } else {
            newFeedbackGrid[row][col] = "missing";
          }
        } else if (grid[row][col]) {
          newFeedbackGrid[row][col] = "extra";
        }
      }
    }

    const isPerfect =
      correctNotes === totalNotes &&
      totalNotes === grid.flat().filter(Boolean).length;
    const attemptsUsedForThisBeat = 3 - attemptsLeft + 1;

    if (isPerfect) {
      // Win!
      const points = Math.max(1, 5 - attemptsUsedForThisBeat) * totalNotes;
      const newScore = score + points;
      const newHighestScore = Math.max(highestScore, newScore);
      const newBeatsCompleted = beatsCompleted + 1;
      const newPerfectSolves =
        perfectSolves + (attemptsUsedForThisBeat === 1 ? 1 : 0);

      setScore(newScore);
      setHighestScore(newHighestScore);
      setBeatsCompleted(newBeatsCompleted);
      setPerfectSolves(newPerfectSolves);
      setGameWon(true);
      setAttemptsUsed(attemptsUsedForThisBeat);

      saveProgress(
        beatNumber,
        newScore,
        newBeatsCompleted,
        totalAttempts + 1,
        newPerfectSolves,
        newHighestScore,
        attemptsLeft
      );

      stopPlayback();
      playVictory("challenge", attemptsUsedForThisBeat === 1);
    } else {
      // Wrong guess
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining <= 0) {
        // Game over
        setGameOver(true);
        setAttemptsUsed(3);

        saveProgress(
          beatNumber,
          score,
          beatsCompleted,
          totalAttempts + 1,
          perfectSolves,
          highestScore,
          0
        );

        toast.error("👻 Game Over! Try again.", {
          duration: 3000,
          position: "top-center",
        });

        stopPlayback();
        playLoss("challenge");
      } else {
        // Continue with remaining attempts
        saveProgress(
          beatNumber,
          score,
          beatsCompleted,
          totalAttempts + 1,
          perfectSolves,
          highestScore,
          remaining
        );
      }
    }
  };

  const resetGame = () => {
    clearGrid();
    setGameWon(false);
    setGameOver(false);
    setAttemptsLeft(3);
    stopPlayback();
    setIsTargetPlaying(false);
  };

  const nextBeat = () => {
    const newBeatNumber = beatNumber + 1;
    const newTargetGrid = generateTargetBeat(newBeatNumber);

    setBeatNumber(newBeatNumber);
    setTargetGrid(newTargetGrid);
    clearGrid();
    setGameWon(false);
    setGameOver(false);
    setAttemptsLeft(3);
    stopPlayback();
    setIsTargetPlaying(false);

    saveProgress(
      newBeatNumber,
      score,
      beatsCompleted,
      totalAttempts,
      perfectSolves,
      highestScore,
      3
    );
  };

  const handleTabClick = (tab: "target" | "recreate") => {
    setMode(tab);
    if (tab === "target") {
      stopPlayback();
    }
  };

  const toggleTargetBeat = async () => {
    if (isTargetPlaying) {
      setIsTargetPlaying(false);
      stopPlayback();
      // Resume the appropriate soundscape
      if (gameOver) {
        playLoss("challenge");
      } else if (gameWon) {
        const isPerfect = attemptsUsed === 1;
        playVictory("challenge", isPerfect);
      }
    } else {
      setIsTargetPlaying(true);
      // Play target grid once (not looping)
      await playPattern(targetGrid, false, () => {
        setIsTargetPlaying(false);
        // Resume the appropriate soundscape after target finishes
        if (gameOver) {
          playLoss("challenge");
        } else if (gameWon) {
          const isPerfect = attemptsUsed === 1;
          playVictory("challenge", isPerfect);
        }
      });
    }
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    stopAllImmediately();

    return () => {
      stopAllImmediately();
      stopPlayback();
      setIsTargetPlaying(false);
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [stopAllImmediately, stopPlayback, setIsTargetPlaying]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        🎧 Listen to the target beat and recreate it using the drum machine.
      </p>

      <div
        className="
          relative
          bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
          border-4 border-gray-700
          rounded-2xl
          shadow-2xl
          w-full max-w-2xl
          p-6
          flex flex-col items-center
          drum-machine-outline
        "
        style={{
          boxShadow: "0 0 0 4px #222 inset, 0 8px 32px 0 rgba(0,0,0,0.8)",
          borderRadius: "1.5rem",
          border: "4px solid #444",
          position: "relative",
        }}
      >
        <h1 className="text-2xl font-extrabold mb-4 font-mono text-center tracking-widest text-amber-400 drop-shadow">
          BEATKERRI 303
        </h1>
        <p className="text-gray-400 font-mono text-center mb-2">
          Beat {beatNumber}
        </p>
        <div className="flex justify-between mb-4 w-full">
          <div className="flex space-x-2">
            <button
              onClick={() => handleTabClick("target")}
              disabled={gameOver || gameWon}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-md transition ${
                mode === "target"
                  ? "bg-purple-700 text-white shadow"
                  : "bg-black text-gray-300 border border-gray-600"
              } ${gameOver || gameWon ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Crosshair size={16} />
              Target
            </button>
            <button
              onClick={() => handleTabClick("recreate")}
              disabled={gameOver || gameWon}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-md transition ${
                mode === "recreate"
                  ? "bg-green-700 text-white shadow"
                  : "bg-black text-gray-300 border border-gray-600"
              } ${gameOver || gameWon ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Wand2 size={16} />
              Recreate
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-end">
            <div className="text-xs font-mono text-gray-400">
              BPM
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {getBpmForBeat(beatNumber)}
              </span>
            </div>
            <div className="text-xs font-mono text-gray-400">
              SCORE
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {score}
              </span>
            </div>
            <div className="text-xs font-mono text-gray-400">
              HIGHEST
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {highestScore}
              </span>
            </div>
            <div className="text-xs font-mono text-gray-400">
              ATTEMPTS
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {attemptsLeft}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full mb-4">
          <SequencerGrid
            grid={grid}
            toggleStep={toggleStep}
            feedbackGrid={feedbackGrid || undefined}
            activeStep={activeStep}
          />
        </div>
        {!gameOver && !gameWon && mode === "recreate" && (
          <div className="flex justify-center gap-2 mt-2 w-full">
            <button
              onClick={togglePlay}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
              title="Play Grid"
            >
              {isPlaying ? <Square size={18} /> : <Play size={18} />}
              <span>{isPlaying ? "Stop" : "Play"}</span>
            </button>
            <button
              onClick={clearGrid}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center space-x-2 transition-colors"
              title="Clear Grid"
            >
              <Trash2 size={18} />
              <span>Clear</span>
            </button>
            <button
              onClick={submitGuess}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded flex items-center space-x-2 transition-colors"
              title="Submit Guess"
            >
              <Zap size={18} />
              <span>Submit</span>
            </button>
          </div>
        )}
        {!gameOver && !gameWon && mode === "target" && (
          <div className="flex justify-center gap-2 mt-2 w-full">
            <button
              onClick={toggleTargetBeat}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
              title="Play Target Beat"
            >
              <Headphones size={18} />
              <span>{isTargetPlaying ? "Stop" : "Listen"}</span>
            </button>
          </div>
        )}
        {gameOver && (
          <>
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <div className="ghost-animation">
                <div className="ghost-body">
                  <div className="ghost-eyes">
                    <div className="ghost-eye"></div>
                    <div className="ghost-eye"></div>
                  </div>
                  <div className="ghost-mouth"></div>
                </div>
              </div>
            </div>
            <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
              GAME OVER
            </div>
            <p className="text-yellow-400 font-mono text-lg">
              <span className="mr-2 text-2xl">
                {getAttemptEmoji(attemptsUsed, gameWon)}
              </span>
              ⭐ Score: {score}
            </p>
            <p className="text-green-400 font-mono text-center">
              {getAttemptMessage(attemptsUsed, gameWon)}
            </p>
            <SequencerGrid
              grid={targetGrid}
              toggleStep={() => {}}
              activeStep={activeStep}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTargetBeat}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
                title="Play Beat"
              >
                <Headphones size={18} className="text-white" />
                <span>{isTargetPlaying ? "Stop" : "Listen"}</span>
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
              >
                <Repeat size={18} className="text-white" />
                <span>Retry This Beat</span>
              </button>
            </div>
          </>
        )}
        {gameWon && (
          <>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={100}
            />
            <div className="text-green-400 text-4xl font-extrabold animate-pulse font-mono">
              CONGRATULATIONS!
            </div>
            <p className="text-yellow-400 font-mono text-lg">
              <span className="mr-2 text-2xl">
                {getAttemptEmoji(attemptsUsed, gameWon)}
              </span>
              ⭐ Score: {score}
            </p>
            <p className="text-green-400 font-mono text-center">
              {getAttemptMessage(attemptsUsed, gameWon)}
            </p>
            <SequencerGrid
              grid={targetGrid}
              toggleStep={() => {}}
              activeStep={activeStep}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTargetBeat}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
                title="Play Beat"
              >
                <Headphones size={18} className="text-white" />
                <span>{isTargetPlaying ? "Stop" : "Listen"}</span>
              </button>
              <button
                onClick={nextBeat}
                className="px-4 py-2 bg-green-600 text-white rounded animate-bounce"
              >
                ✅ Next Beat
              </button>
            </div>
          </>
        )}
        <div className="absolute bottom-2 right-2">
          <Link
            href="/how-to-play#challenge-mode"
            className="w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-300 border-2 border-gray-900 flex items-center justify-center transition-colors shadow-lg"
            onClick={() => playSubmitClick()}
            title="How To Play Challenge Mode"
          >
            <HelpCircle size={16} className="text-gray-900" />
          </Link>
        </div>
      </div>

      {/* Simple Stats Display */}
      <div className="mt-8 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Beats Completed</div>
            <div className="text-green-400 font-bold text-lg">
              {beatsCompleted}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Total Attempts</div>
            <div className="text-blue-400 font-bold text-lg">
              {totalAttempts}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Perfect Solves</div>
            <div className="text-purple-400 font-bold text-lg">
              {perfectSolves}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Current Score</div>
            <div className="text-yellow-400 font-bold text-lg">{score}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
