"use client";

import { useState, useRef, useEffect } from "react";
import { SequencerGrid } from "../components/SequencerGrid";

export default function Home() {
  const createEmptyGrid = () =>
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(false));

  const createRandomPattern = () => {
    const grid = createEmptyGrid();
    let totalNotes = 0;

    while (totalNotes < 8) {
      const row = Math.floor(Math.random() * 3);
      const col = Math.floor(Math.random() * 16);
      if (!grid[row][col]) {
        grid[row][col] = true;
        totalNotes++;
      }
    }
    return grid;
  };

  const [grid, setGrid] = useState(createEmptyGrid());
  const [targetGrid, setTargetGrid] = useState(createRandomPattern());
  const [feedbackGrid, setFeedbackGrid] = useState<("correct" | "incorrect" | null)[][] | null>(null);
  const [mode, setMode] = useState<"target" | "recreate">("recreate");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [claimedCorrectSteps, setClaimedCorrectSteps] = useState<boolean[][]>(createEmptyGrid());

  const padPlayers = useRef<any>(null);

  const instruments = [
    "kick",
    "snare",
    "closed_hihat",
    "open_hihat",
    "low_tom",
    "high_tom",
    "clap",
  ];

  const ensurePadPlayers = async () => {
    if (!padPlayers.current) {
      const Tone = await import("tone");
      await Tone.start();
      padPlayers.current = new Tone.Players({
        kick: "/samples/kick.wav",
        snare: "/samples/snare.wav",
        closed_hihat: "/samples/closed_hihat.wav",
        open_hihat: "/samples/open_hihat.wav",
        clap: "/samples/clap.wav",
        low_tom: "/samples/low_tom.wav",
        high_tom: "/samples/high_tom.wav",
      }).toDestination();
    }
  };

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate" && !gameOver && !gameWon) {
      const newGrid = grid.map((r, i) =>
        i === row ? r.map((s, j) => (j === col ? !s : s)) : r
      );
      setGrid(newGrid);

      await ensurePadPlayers();
      padPlayers.current?.player(instruments[row]).start();
    }
  };

  const playPattern = async (pattern: boolean[][]) => {
    const Tone = await import("tone");
    await ensurePadPlayers();

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = 100;

    const seq = new Tone.Sequence(
      (time, col) => {
        setActiveStep(col);
        pattern.forEach((row, rowIndex) => {
          if (row[col]) {
            padPlayers.current.player(instruments[rowIndex]).start(time);
          }
        });
      },
      [...Array(16).keys()],
      "16n"
    );

    seq.start(0);
    Tone.Transport.start();

    setTimeout(() => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      setActiveStep(null);
    }, 4000);
  };

  const playGrid = () => playPattern(grid);
  const playTargetGrid = () => playPattern(targetGrid);

  const stopPlayback = async () => {
    const Tone = await import("tone");
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setActiveStep(null);
  };

  const submitGuess = () => {
    const newFeedback = grid.map((row, rowIndex) =>
      row.map((step, colIndex) => {
        if (step) {
          if (targetGrid[rowIndex][colIndex]) return "correct";
          else return "incorrect";
        }
        return null;
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

    if (allCorrect) {
      totalScore += 10;
      setGameWon(true);
      stopPlayback();
    } else {
      const remaining = attemptsLeft - 1;
      if (remaining <= 0) {
        setGameOver(true);
        stopPlayback();
      } else {
        setAttemptsLeft(remaining);
        alert(`You scored ${newlyCorrect * pointsPerCorrect} points. Attempts left: ${remaining}`);
      }
    }

    setClaimedCorrectSteps(updatedClaimed);
    setScore(totalScore);
  };

  const clearGrid = () => {
    setGrid(createEmptyGrid());
    setFeedbackGrid(null);
    setActiveStep(null);
  };

  const resetGame = () => {
    setGameOver(false);
    setGameWon(false);
    setGrid(createEmptyGrid());
    setFeedbackGrid(null);
    setAttemptsLeft(3);
    setMode("recreate");
    setActiveStep(null);
    setScore(0);
    setClaimedCorrectSteps(createEmptyGrid());
    setTargetGrid(createRandomPattern());
  };

  const handleTabClick = async (tab: "target" | "recreate") => {
    if (gameOver || gameWon) return;
    setMode(tab);
    await stopPlayback();
    if (tab === "target") playTargetGrid();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-2 font-mono">BeatKerri</h1>
      <p className="mb-2 text-gray-400 font-mono">Attempts Left: {attemptsLeft}</p>
      <p className="mb-4 text-sm text-yellow-400 font-mono">⭐ Score: {score}</p>

      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => handleTabClick("target")}
          disabled={gameOver || gameWon}
          className={`px-4 py-2 rounded ${
            mode === "target" ? "bg-purple-600" : "bg-gray-700"
          } ${gameOver || gameWon ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          🎵 Target Beat
        </button>
        <button
          onClick={() => handleTabClick("recreate")}
          disabled={gameOver || gameWon}
          className={`px-4 py-2 rounded ${
            mode === "recreate" ? "bg-green-600" : "bg-gray-700"
          } ${gameOver || gameWon ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          ✨ Recreate
        </button>
      </div>

      <SequencerGrid
        grid={grid}
        toggleStep={toggleStep}
        feedbackGrid={feedbackGrid || undefined}
        activeStep={activeStep}
      />

      {!gameOver && !gameWon && mode === "recreate" && (
        <div className="flex space-x-2 mt-4 flex-wrap">
          <button
            onClick={playGrid}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            ▶ Play My Pattern
          </button>
          <button
            onClick={stopPlayback}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            ⏹ Stop
          </button>
          <button
            onClick={submitGuess}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            ✅ Submit Guess
          </button>
          <button
            onClick={clearGrid}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            🗑 Clear
          </button>
        </div>
      )}

      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          {gameOver && (
            <>
              <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
                👻 GAME OVER 👻
              </div>
              <p className="text-yellow-400 font-mono text-lg">⭐ Total Score: {score}</p>
              <SequencerGrid
                grid={targetGrid}
                activeStep={activeStep}
              />
              <button
                onClick={resetGame}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              >
                🔄 Restart Game
              </button>
            </>
          )}
          {gameWon && (
            <>
              <div className="text-green-400 text-4xl font-extrabold animate-pulse font-mono">
                🎉 CONGRATULATIONS! 🎉
              </div>
              <p className="text-yellow-400 font-mono text-lg">⭐ Total Score: {score}</p>
              <SequencerGrid
                grid={targetGrid}
                activeStep={activeStep}
              />
              <button
                onClick={resetGame}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded animate-bounce"
              >
                ✅ Play Again
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
