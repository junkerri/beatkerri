"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import seedrandom from "seedrandom";
import { SequencerGrid } from "@/components/SequencerGrid";
import {
  Play,
  Square,
  Repeat,
  Trash2,
  Send,
  Wand2,
  Crosshair,
} from "lucide-react";
import toast from "react-hot-toast";

const createEmptyGrid = () =>
  Array(7)
    .fill(null)
    .map(() => Array(16).fill(false));

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

const instruments = [
  "kick",
  "snare",
  "closed_hihat",
  "open_hihat",
  "low_tom",
  "high_tom",
  "clap",
];

// Add attempt history for Wordle-style sharing
type Attempt = {
  grid: boolean[][];
  feedback: ("correct" | "incorrect" | null)[][];
};

export default function BeatdleMode() {
  const beatNumber = getTodayBeatNumber();
  const bpm = getDailyBPM(beatNumber);
  const targetGrid = createDailyPattern(beatNumber);

  const [grid, setGrid] = useState(createEmptyGrid());
  const [mode, setMode] = useState<"target" | "recreate">("recreate");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [feedbackGrid, setFeedbackGrid] = useState<
    ("correct" | "incorrect" | null)[][] | null
  >(null);
  const [claimedCorrectSteps, setClaimedCorrectSteps] = useState(
    createEmptyGrid()
  );
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [beatsCompleted, setBeatsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [perfectSolves, setPerfectSolves] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [attemptHistory, setAttemptHistory] = useState<Attempt[]>([]);

  // Track if user has already played today's beat
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

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
  }, [beatNumber]);

  const togglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
    } else {
      if (mode === "target") {
        await playPattern(targetGrid);
      } else {
        await playPattern(grid);
      }
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setActiveStep(null);
    setIsPlaying(false);
  };

  const playPattern = async (pattern: boolean[][]) => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = bpm;

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

    seq.loop = isLooping;
    seq.start(0);

    Tone.Transport.start();

    if (!isLooping) {
      Tone.Transport.scheduleOnce(() => {
        setIsPlaying(false);
        setActiveStep(null);
      }, "+1m");
    }
  };

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate") {
      const newGrid = grid.map((r, i) =>
        i === row ? r.map((s, j) => (j === col ? !s : s)) : r
      );
      setGrid(newGrid);
      await Tone.start();
      padPlayers.current?.player(instruments[row]).start();
    }
  };

  const handleTabClick = (tab: "target" | "recreate") => {
    setMode(tab);
    stopPlayback();
    if (tab === "target") {
      playPattern(targetGrid);
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

  function getShareText() {
    const solved = gameWon;
    const attemptsUsed = attemptHistory.length;
    const maxAttempts = 3;
    const header = solved
      ? `Beatdle #${beatNumber} ${attemptsUsed}/${maxAttempts} 🎉`
      : `Beatdle #${beatNumber} X/${maxAttempts} 😵`;
    const rows = attemptHistory
      .map((a) => getShareRow(a.grid, a.feedback))
      .join("\n");
    return `${header}\nScore: ${score}\n${rows}\nhttps://beatkerri.com/beatdle`;
  }

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
      navigator.clipboard.writeText(text);
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

      stopPlayback();

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
        stopPlayback();
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

        toast.error("👻 Game Over! Try again.", {
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

  // If already played, show message and block game UI
  if (alreadyPlayed) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl font-extrabold animate-pulse font-mono text-red-500">
            🕐 ALREADY PLAYED TODAY 🕐
          </div>
          <p className="text-yellow-400 font-mono text-lg">
            ⭐ Final Score: {score}
          </p>
          <div className="mb-4">
            <SequencerGrid
              grid={targetGrid}
              toggleStep={() => {}}
              activeStep={activeStep}
            />
            <p className="text-center text-gray-400 mt-2 font-mono text-sm">
              Solution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center space-x-2"
            >
              <Send size={18} className="text-white" />
              <span>Share Results</span>
            </button>
          </div>
          <p className="text-gray-400 font-mono text-center mt-4">
            Come back tomorrow for a new beat!
          </p>
          <p className="text-gray-500 font-mono text-center text-xs">
            Next beat available in {getTimeUntilNextBeat()}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        🧩 Beatdle #{beatNumber} — Listen & Recreate
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
        <div className="flex justify-between mb-4 w-full">
          <div className="flex space-x-2">
            <button
              onClick={() => handleTabClick("target")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-md transition ${
                mode === "target"
                  ? "bg-purple-700 text-white shadow"
                  : "bg-black text-gray-300 border border-gray-600"
              }`}
            >
              <Crosshair size={16} /> Target
            </button>
            <button
              onClick={() => handleTabClick("recreate")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-md transition ${
                mode === "recreate"
                  ? "bg-green-700 text-white shadow"
                  : "bg-black text-gray-300 border border-gray-600"
              }`}
            >
              <Wand2 size={16} /> Recreate
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-end">
            <div className="text-xs font-mono text-gray-400">
              BPM
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {bpm}
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
            feedbackGrid={feedbackGrid || undefined} // <-- This will show feedback!
            activeStep={activeStep}
          />
        </div>
        {mode === "recreate" && (
          <div className="flex justify-center gap-2 mt-2 w-full">
            <button
              onClick={togglePlay}
              className={`p-4 rounded-lg shadow ${
                isPlaying ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {isPlaying ? <Square /> : <Play />}
            </button>
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-4 rounded-lg shadow transition ${
                isLooping
                  ? "bg-purple-600 hover:bg-purple-500"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              title="Toggle Looping"
            >
              <Repeat className="w-7 h-7" />
            </button>
            <button
              onClick={submitGuess}
              className="p-4 bg-blue-600 hover:bg-blue-500 rounded-lg shadow"
              title="Submit Guess"
            >
              <Send className="w-7 h-7" />
            </button>
            <button
              onClick={() => {
                setGrid(createEmptyGrid());
                stopPlayback();
              }}
              className="p-4 bg-gray-700 rounded-lg shadow"
            >
              <Trash2 />
            </button>
          </div>
        )}
        <footer className="mt-6 text-gray-500 text-xs font-mono w-full text-center">
          © {new Date().getFullYear()} Junkerri
        </footer>
        {/* Optional: Add drum machine "knobs" or "lights" for more realism */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-700 border-2 border-gray-800 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-gray-800 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-gray-800 shadow-inner"></div>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-900"></div>
          <div className="w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-900"></div>
        </div>
      </div>

      {/* Game Over / Win Overlay */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          <div
            className={`text-4xl font-extrabold animate-pulse font-mono ${
              gameOver ? "text-red-500" : "text-green-400"
            }`}
          >
            {gameOver ? "👻 GAME OVER 👻" : "🎉 CONGRATULATIONS! 🎉"}
          </div>
          <p className="text-yellow-400 font-mono text-lg">⭐ Score: {score}</p>
          <div className="mb-4">
            {/* Show the solution grid visually, but not in share */}
            <SequencerGrid
              grid={targetGrid}
              toggleStep={() => {}}
              activeStep={activeStep}
            />
            <p className="text-center text-gray-400 mt-2 font-mono text-sm">
              Solution
            </p>
          </div>
          {/* Removed Wordle-style squares from overlay */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center space-x-2"
            >
              <Send size={18} className="text-white" />
              <span>Share Results</span>
            </button>
          </div>
          <p className="text-gray-400 font-mono text-center mt-4">
            Come back tomorrow for a new beat!
          </p>
          <p className="text-gray-500 font-mono text-center text-xs">
            Next beat available in {getTimeUntilNextBeat()}
          </p>
        </div>
      )}
    </main>
  );
}
