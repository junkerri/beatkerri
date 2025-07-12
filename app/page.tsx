"use client";

import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import seedrandom from "seedrandom";
import { SequencerGrid } from "../components/SequencerGrid";

export default function Home() {
  const createEmptyGrid = () =>
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(false));

  const createPatternForBeat = (beatNumber: number) => {
    const grid = createEmptyGrid();
    const rng = seedrandom(`Beat${beatNumber}`);

    let instrumentsRange = 3;
    let maxNotes = 8;
    let allowedCols = [0, 4, 8, 12];

    if (beatNumber >= 6 && beatNumber <= 10) {
      instrumentsRange = 4;
      maxNotes = 10;
    } else if (beatNumber >= 11 && beatNumber <= 15) {
      instrumentsRange = 5;
      maxNotes = 12;
      allowedCols = Array.from({ length: 16 }, (_, i) => i);
    } else if (beatNumber >= 16) {
      instrumentsRange = 7;
      maxNotes = 16;
      allowedCols = Array.from({ length: 16 }, (_, i) => i);
    }

    let totalNotes = 0;
    while (totalNotes < maxNotes) {
      const row = Math.floor(rng() * instrumentsRange);
      const col = allowedCols[Math.floor(rng() * allowedCols.length)];
      if (!grid[row][col]) {
        grid[row][col] = true;
        totalNotes++;
      }
    }

    return grid;
  };

  const [grid, setGrid] = useState(createEmptyGrid());
  const [beatNumber, setBeatNumber] = useState(1);
  const [targetGrid, setTargetGrid] = useState(createPatternForBeat(1));
  const [feedbackGrid, setFeedbackGrid] = useState<("correct" | "incorrect" | null)[][] | null>(null);
  const [mode, setMode] = useState<"target" | "recreate">("recreate");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [claimedCorrectSteps, setClaimedCorrectSteps] = useState<boolean[][]>(createEmptyGrid());
  const [beatsCompleted, setBeatsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [perfectSolves, setPerfectSolves] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("beatkerri_progress");
    if (saved) {
      const data = JSON.parse(saved);
      setBeatNumber(data.beatNumber || 1);
      setScore(data.score || 0);
      setHighestScore(data.highestScore || 0);
      setBeatsCompleted(data.beatsCompleted || 0);
      setTotalAttempts(data.totalAttempts || 0);
      setPerfectSolves(data.perfectSolves || 0);
      setTargetGrid(createPatternForBeat(data.beatNumber || 1));
    }
  }, []);

  const saveProgress = (
    newBeatNumber = beatNumber,
    newScore = score,
    newBeatsCompleted = beatsCompleted,
    newTotalAttempts = totalAttempts,
    newPerfectSolves = perfectSolves,
    newHighestScore = highestScore
  ) => {
    localStorage.setItem("beatkerri_progress", JSON.stringify({
      beatNumber: newBeatNumber,
      score: newScore,
      beatsCompleted: newBeatsCompleted,
      totalAttempts: newTotalAttempts,
      perfectSolves: newPerfectSolves,
      highestScore: newHighestScore
    }));
  };

  const padPlayers = useRef<Tone.Players | null>(null);
  useEffect(() => {
    padPlayers.current = new Tone.Players({
      kick: "/samples/kick.wav",
      snare: "/samples/snare.wav",
      closed_hihat: "/samples/closed_hihat.wav",
      open_hihat: "/samples/open_hihat.wav",
      clap: "/samples/clap.wav",
      low_tom: "/samples/low_tom.wav",
      high_tom: "/samples/high_tom.wav",
    }).toDestination();
  }, []);

  const instruments = [
    "kick",
    "snare",
    "closed_hihat",
    "open_hihat",
    "clap",
    "low_tom",
    "high_tom",
  ];

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate" && !gameOver && !gameWon) {
      const newGrid = grid.map((r, i) =>
        i === row ? r.map((s, j) => (j === col ? !s : s)) : r
      );
      setGrid(newGrid);

      await Tone.start();
      padPlayers.current?.player(instruments[row]).start();
    }
  };

  const playPattern = async (pattern: boolean[][]) => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = 100;

    const players = new Tone.Players({
      kick: "/samples/kick.wav",
      snare: "/samples/snare.wav",
      closed_hihat: "/samples/closed_hihat.wav",
      open_hihat: "/samples/open_hihat.wav",
      clap: "/samples/clap.wav",
      low_tom: "/samples/low_tom.wav",
      high_tom: "/samples/high_tom.wav",
    }).toDestination();

    const seq = new Tone.Sequence(
      (time, col) => {
        setActiveStep(col);
        pattern.forEach((row, rowIndex) => {
          if (row[col]) {
            players.player(instruments[rowIndex]).start(time);
          }
        });
      },
      [...Array(16).keys()],
      "16n"
    );

    seq.start(0);
    Tone.Transport.start();
  };

  const playGrid = () => playPattern(grid);
  const playTargetGrid = () => playPattern(targetGrid);

  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setActiveStep(null);
  };

  useEffect(() => {
    if (gameOver || gameWon) {
      playTargetGrid();
    }
  }, [gameOver, gameWon]);

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
  updatedHighest
);

      stopPlayback();
    } else {
      const remaining = attemptsLeft - 1;
      setTotalAttempts(newTotalAttempts);
      saveProgress(
        beatNumber,
        totalScore,
        beatsCompleted,
        newTotalAttempts,
        perfectSolves,
        highestScore
      );
      if (remaining <= 0) {
  setGameOver(true);
  stopPlayback();
  saveProgress(
    beatNumber,
    0,                // reset current score
    beatsCompleted,
    newTotalAttempts,
    perfectSolves,
    highestScore      // keep highest score
  );
} else {
  setAttemptsLeft(remaining);
  saveProgress(
    beatNumber,
    totalScore,
    beatsCompleted,
    newTotalAttempts,
    perfectSolves,
    updatedHighest
  );
  alert(`You matched ${correctCount}/${targetNoteCount} notes (${remainingNotes} more to go). You scored ${newlyCorrect * pointsPerCorrect} points.`);
}

    }

    setClaimedCorrectSteps(updatedClaimed);
    setScore(totalScore);
  };

  const clearGrid = () => {
    setGrid(createEmptyGrid());
    setFeedbackGrid(null);
    stopPlayback();
  };

  const resetGame = () => {
    setGameOver(false);
    setGameWon(false);
    setGrid(createEmptyGrid());
    setFeedbackGrid(null);
    setAttemptsLeft(3);
    setMode("recreate");
    setActiveStep(null);
    setScore(0); // Reset score when retrying
    setClaimedCorrectSteps(createEmptyGrid());
    setTargetGrid(createPatternForBeat(beatNumber));
    stopPlayback();
  };

  const nextBeat = () => {
  const next = beatNumber + 1;
  setGameWon(false);
  setBeatNumber(next);
  setGrid(createEmptyGrid());
  setFeedbackGrid(null);
  setAttemptsLeft(3);
  setMode("recreate");
  setActiveStep(null);
  // ❌ Do NOT reset score here—so it keeps accumulating
  setClaimedCorrectSteps(createEmptyGrid());
  setTargetGrid(createPatternForBeat(next));
  stopPlayback();
  saveProgress(next, score, beatsCompleted, totalAttempts, perfectSolves, highestScore);
};


  const handleTabClick = (tab: "target" | "recreate") => {
    if (gameOver || gameWon) return;
    setMode(tab);
    stopPlayback();
    if (tab === "target") {
      playTargetGrid();
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-2 font-mono">BeatKerri</h1>
      <p className="mb-2 text-gray-400 font-mono">Beat {beatNumber}</p>
      <p className="mb-2 text-sm text-gray-500 font-mono">Attempts Left: {attemptsLeft}</p>
      <p className="mb-4 text-sm text-yellow-400 font-mono">⭐ Score: {score} | 🏆 High Score: {highestScore}</p>
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

      <div className="bg-gray-900 rounded-lg p-4 inline-block relative">
        <SequencerGrid
          grid={grid}
          toggleStep={toggleStep}
          feedbackGrid={feedbackGrid || undefined}
          activeStep={activeStep}
        />
      </div>

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

     {/* Stats panel */}
<div className="mt-6 w-full max-w-md bg-gray-800 p-4 rounded-lg text-sm space-y-2">
  <h2 className="text-lg font-bold mb-2 text-white font-mono">Stats</h2>
  <p className="text-gray-300 font-mono">✅ Beats Completed: {beatsCompleted}</p>
  <p className="text-gray-300 font-mono">🎯 Perfect Solves: {perfectSolves}</p>
  <p className="text-gray-300 font-mono">🏆 Highest Score: {highestScore}</p>
</div>


      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          {gameOver && (
            <>
              <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
                👻 GAME OVER 👻
              </div>
              <p className="text-yellow-400 font-mono text-lg">⭐ Score: {score}</p>
              <SequencerGrid
                grid={targetGrid}
                activeStep={activeStep}
              />
              <button
                onClick={resetGame}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              >
                🔄 Retry This Beat
              </button>
            </>
          )}
          {gameWon && (
            <>
              <div className="text-green-400 text-4xl font-extrabold animate-pulse font-mono">
                🎉 CONGRATULATIONS! 🎉
              </div>
              <p className="text-yellow-400 font-mono text-lg">⭐ Score: {score}</p>
              <SequencerGrid
                grid={targetGrid}
                activeStep={activeStep}
              />
              <button
                onClick={nextBeat}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded animate-bounce"
              >
                ✅ Next Beat
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
