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
  Wand2,
  Crosshair,
  Headphones,
  Trophy,
  Clock,
  Target,
  Music,
  Share2,
  Zap,
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
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  // --- ADDED STATE FOR AUDIO SHARING ---
  const [isTargetPlaying, setIsTargetPlaying] = useState(false);

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

  const playPattern = async (
    pattern: boolean[][],
    loop: boolean = isLooping,
    onDone?: () => void
  ) => {
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

    seq.loop = loop;
    seq.start(0);

    Tone.Transport.start();

    if (!loop) {
      Tone.Transport.scheduleOnce(() => {
        setIsPlaying(false);
        setActiveStep(null);
        if (onDone) onDone();
      }, `+${(16 * 60) / bpm}`);
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

  // Visual squares for overlay
  function getShareText() {
    const solved = gameWon;
    const attemptsUsed = attemptHistory.length;
    const maxAttempts = 3;
    const attemptStr = solved
      ? `${attemptsUsed}/${maxAttempts}`
      : `X/${maxAttempts}`;
    const header = `Beatdle #${beatNumber} ${attemptStr} 🎧`;
    // All attempts' colored squares, each on a new line
    const rows = attemptHistory
      .map((a) => getShareRow(a.grid, a.feedback))
      .join("\n");
    return `${header}\n${rows}\nScore: ${score}\nCan you beat it?\nhttps://beatkerri.vercel.app/`;
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
      await navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  // Share menu/modal state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const handleCopyShare = async () => {
    await navigator.clipboard.writeText(getShareText());
    toast.success("Results copied to clipboard!");
    setShowShareMenu(false);
  };
  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=https://beatkerri.vercel.app/`,
      "_blank"
    );
    setShowShareMenu(false);
  };
  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    setShowShareMenu(false);
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
      Tone.Transport.stop();
      Tone.Transport.cancel();
      setActiveStep(null);
      setIsTargetPlaying(false);
    } else {
      setIsTargetPlaying(true);
      await playPattern(targetGrid, false, () => setIsTargetPlaying(false));
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
            <Trophy className="inline w-5 h-5 mr-2" />
            Final Score: {score}
          </p>
          <div className="mb-4">
            <SequencerGrid
              grid={targetGrid}
              toggleStep={() => {}}
              activeStep={activeStep}
            />
            <p className="text-center text-gray-400 mt-2 font-mono text-sm">
              <Target className="inline w-4 h-4 mr-1" />
              Solution
            </p>
          </div>
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
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        <Music className="inline w-4 h-4 mr-1" />
        Beatdle #{beatNumber} — Listen & Recreate
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
              className={`p-4 rounded-lg shadow transition-colors ${
                isPlaying
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-green-600 hover:bg-green-500"
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
              className="p-4 bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition-colors"
              title="Submit Guess"
            >
              <Zap className="w-7 h-7" />
            </button>
            <button
              onClick={() => {
                setGrid(createEmptyGrid());
                stopPlayback();
              }}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow transition-colors"
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
          <p className="text-yellow-400 font-mono text-lg">
            <Trophy className="inline w-5 h-5 mr-2" />
            {gameWon
              ? `Congratulations! You scored ${score} points!`
              : `Final Score: ${score}`}
          </p>
          <div className="mb-4">
            {/* Show the solution grid visually, as before */}
            <SequencerGrid
              grid={targetGrid}
              toggleStep={() => {}}
              activeStep={activeStep}
            />
            <p className="text-center text-gray-400 mt-2 font-mono text-sm">
              <Target className="inline w-4 h-4 mr-1" />
              Solution
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTargetBeat}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
              title="Play Beat"
            >
              <Headphones size={22} className="text-white" />
              <span>{isTargetPlaying ? "Stop" : "Listen"}</span>
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
      )}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 flex flex-col gap-4 items-center w-80">
            <button
              onClick={handleShareFacebook}
              className="w-full flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-facebook"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>{" "}
              Facebook
            </button>
            <button
              onClick={handleShareTwitter}
              className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>{" "}
              Twitter/X
            </button>
            <div className="w-full flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded opacity-80 cursor-not-allowed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <path d="M15 6v8h-3V6h3z" />
                <circle cx="12" cy="12" r="3" />
                <path d="M19 5h-2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-2" />
              </svg>{" "}
              Instagram (screenshot & share!)
            </div>
            <button
              onClick={handleCopyShare}
              className="w-full flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-copy"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="9" y="3" width="6" height="4" />
                <path d="M9 17h6" />
                <path d="M9 21h6" />
              </svg>{" "}
              Copy
            </button>
            <button
              onClick={() => setShowShareMenu(false)}
              className="mt-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
