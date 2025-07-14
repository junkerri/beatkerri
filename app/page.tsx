"use client";

import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import seedrandom from "seedrandom";
import { SequencerGrid } from "../components/SequencerGrid";
import toast from "react-hot-toast";


export default function Home() {
  const createEmptyGrid = () =>
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(false));

  const createPatternForBeat = (beatNumber: number) => {
  const grid = createEmptyGrid();
  const rng = seedrandom(`Beat${beatNumber}`);

  if (beatNumber <= 5) {
    // Beats 1–5: exactly one note per quarter note
    const allowedCols = [0, 2, 4, 6, 8, 10, 12, 14];
    allowedCols.forEach((col) => {
      const row = Math.floor(rng() * 3); // Kick, Snare, Closed HH
      grid[row][col] = true;
    });
    return grid;
  }

  if (beatNumber <= 10) {
    // Beats 6–10: 10–12 notes, some empty beats, max 1 stack per column
    const allowedRows = 4; // Kick, Snare, Closed HH, Open HH
    const targetNotes = Math.floor(rng() * 3) + 10; // 10–12 notes

    const columnCounts = Array(16).fill(0);
    let totalNotes = 0;

    while (totalNotes < targetNotes) {
      const row = Math.floor(rng() * allowedRows);
      const col = Math.floor(rng() * 16);

      if (!grid[row][col] && columnCounts[col] < 1) {
        grid[row][col] = true;
        columnCounts[col]++;
        totalNotes++;
      }
    }
    return grid;
  }

  if (beatNumber <= 15) {
    // Beats 11–15: 14–16 notes, max 2 stacks per column, adds Clap
    const allowedRows = 5; // + Clap
    const targetNotes = Math.floor(rng() * 3) + 14; // 14–16 notes

    const columnCounts = Array(16).fill(0);
    let totalNotes = 0;

    while (totalNotes < targetNotes) {
      const row = Math.floor(rng() * allowedRows);
      const col = Math.floor(rng() * 16);

      if (!grid[row][col] && columnCounts[col] < 2) {
        grid[row][col] = true;
        columnCounts[col]++;
        totalNotes++;
      }
    }
    return grid;
  }

  // Beat 16+: fully random, 16 notes, all instruments, unlimited stacks
  const allowedRows = 7;
  let totalNotes = 0;

  while (totalNotes < 16) {
    const row = Math.floor(rng() * allowedRows);
    const col = Math.floor(rng() * 16);
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
  "low_tom",
  "high_tom",
  "clap",
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

   seq.start(undefined, 0); // Start immediately from step 0
Tone.Transport.start("+0.1"); // Small offset to ensure smooth scheduling

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

    // ✅ Toast for perfect solve
    toast.success(`🎉 Perfect! You recreated the beat and earned ${newlyCorrect * pointsPerCorrect + 10} total points!`, {
      style: {
        background: "#22c55e",
        color: "#fff",
      },
      duration: 4000,
    });
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
        0, // reset score
        beatsCompleted,
        newTotalAttempts,
        perfectSolves,
        highestScore
      );

      // ✅ Toast for Game Over
      toast.error("👻 Game Over! Try again.", {
        style: {
          background: "#b91c1c",
          color: "#fff",
        },
        duration: 4000,
      });
    } else {
      setAttemptsLeft(remaining);
      saveProgress(
        beatNumber,
        totalScore,
        beatsCompleted,
        newTotalAttempts,
        perfectSolves,
        highestScore
      );

      // ✅ Toast for partial attempt
      toast(`🎯 You matched ${correctCount}/${targetNoteCount} notes (${remainingNotes} more to go). You scored ${newlyCorrect * pointsPerCorrect} points.`, {
        style: {
          background: "#333",
          color: "#fff",
        },
        duration: 4000,
      });
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
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 inline-block shadow-lg w-full max-w-2xl">
      <h1 className="text-xl font-bold mb-2 font-mono text-center tracking-widest">
        BEATKERRI 303
      </h1>

      <p className="text-gray-400 font-mono text-center mb-2">Beat {beatNumber}</p>

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2 w-full">
  <div className="flex space-x-2">
    <button
      onClick={() => handleTabClick("target")}
      disabled={gameOver || gameWon}
      className={`px-3 py-1 text-xs font-mono border border-gray-600 rounded ${
        mode === "target" ? "bg-purple-700 text-white" : "bg-black text-gray-300"
      } ${gameOver || gameWon ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      🎯  TARGET
    </button>
    <button
      onClick={() => handleTabClick("recreate")}
      disabled={gameOver || gameWon}
      className={`px-3 py-1 text-xs font-mono border border-gray-600 rounded ${
        mode === "recreate" ? "bg-green-700 text-white" : "bg-black text-gray-300"
      } ${gameOver || gameWon ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      🪄 RECREATE
    </button>
  </div>

  <div className="flex flex-wrap gap-2 items-center justify-end">
    <div className="text-xs font-mono text-gray-400">
      BPM
      <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
        100
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


      <SequencerGrid
        grid={grid}
        toggleStep={toggleStep}
        feedbackGrid={feedbackGrid || undefined}
        activeStep={activeStep}
      />

      {!gameOver && !gameWon && mode === "recreate" && (
        <div className="flex space-x-1 mt-3 justify-center">
          <button
            onClick={playGrid}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
            title="Play My Pattern"
          >
            ▶
          </button>
          <button
            onClick={stopPlayback}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
            title="Stop"
          >
            ■
          </button>
          <button
            onClick={submitGuess}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
            title="Submit Guess"
          >
            ✅
          </button>
          <button
            onClick={clearGrid}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
            title="Clear"
          >
            🗑
          </button>
        </div>
      )}

     
    </div>

    <div className="mt-4 w-full max-w-md bg-gray-800 p-3 rounded-lg text-sm space-y-1">
      <h2 className="text-base font-bold text-white font-mono mb-1">Stats</h2>
      <p className="text-gray-300 font-mono">Beats Completed: {beatsCompleted}</p>
      <p className="text-gray-300 font-mono">Perfect Solves: {perfectSolves}</p>
      <p className="text-gray-300 font-mono">Highest Score: {highestScore}</p>

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
              toggleStep={() => {}}
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
              toggleStep={() => {}}
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

    <footer className="mt-6 text-gray-500 text-xs font-mono">
      © {new Date().getFullYear()} Junkerri
    </footer>
  </main>
);

}

 