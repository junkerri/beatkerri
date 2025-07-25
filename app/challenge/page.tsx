"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import * as Tone from "tone";
import seedrandom from "seedrandom";
import { SequencerGrid } from "@/components/SequencerGrid";

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
} from "lucide-react";

export default function Home() {
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
        [0, 2],
        [0, 6],
        [0, 1],
        [0, 3], // BD + OH
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

  const [grid, setGrid] = useState(createEmptyGrid());
  const [beatNumber, setBeatNumber] = useState(1);
  const [targetGrid, setTargetGrid] = useState(createPatternForBeat(1));
  const [feedbackGrid, setFeedbackGrid] = useState<
    ("correct" | "incorrect" | null)[][] | null
  >(null);
  const [mode, setMode] = useState<"target" | "recreate">("recreate");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [claimedCorrectSteps, setClaimedCorrectSteps] = useState<boolean[][]>(
    createEmptyGrid()
  );
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
      setAttemptsLeft(data.attemptsLeft ?? 3); // 👈 Restore attempts
      setTargetGrid(createPatternForBeat(data.beatNumber || 1));
    }
  }, [createPatternForBeat]);

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

  const instruments = useMemo(
    () => [
      "kick",
      "snare",
      "closed_hihat",
      "open_hihat",
      "low_tom",
      "high_tom",
      "clap",
    ],
    []
  );

  const togglePlay = async () => {
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
      const newGrid = grid.map((r, i) =>
        i === row ? r.map((s, j) => (j === col ? !s : s)) : r
      );
      setGrid(newGrid);

      await Tone.start();
      padPlayers.current?.player(instruments[row]).start();
    }
  };

  const playPattern = useCallback(
    async (pattern: boolean[][], beatNumber: number) => {
      await Tone.start();
      console.log("🔍 Playing pattern:", pattern);
      // 🛠 Step 2 validation
      pattern.forEach((row, rowIndex) => {
        if (row.length !== 16 || rowIndex >= instruments.length) {
          console.warn(`⚠️ Row ${rowIndex} may be invalid`, row);
        }
      });
      Tone.Transport.stop();
      Tone.Transport.cancel();

      Tone.Transport.bpm.value = getBpmForBeat(beatNumber);

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
            if (row[col] && instruments[rowIndex]) {
              players.player(instruments[rowIndex]).start(time);
            }
          });
        },
        [...Array(16).keys()],
        "16n"
      );

      seq.loop = isLooping;
      seq.start(undefined, 0);

      // Only auto-reset when not looping
      Tone.Transport.scheduleOnce(() => {
        setIsPlaying(false);
        setActiveStep(null);
      }, `+${isLooping ? 1000 : "1m"}`);

      Tone.Transport.start("+0.1");
      setIsPlaying(true);
    },
    [instruments, isLooping]
  );

  const playGrid = () => playPattern(grid, beatNumber);
  const playTargetGrid = useCallback(
    () => playPattern(targetGrid, beatNumber),
    [targetGrid, beatNumber, playPattern]
  );

  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setActiveStep(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    const isReady =
      targetGrid && targetGrid.length > 0 && targetGrid[0].length > 0;

    if (isReady && (gameOver || gameWon)) {
      playTargetGrid();
    }
  }, [gameOver, gameWon, targetGrid, playTargetGrid]);

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
        beatNumber, // ✅ Correct here
        totalScore,
        beatsCompleted + 1,
        newTotalAttempts,
        perfectSolves + (attemptsLeft === 3 ? 1 : 0),
        updatedHighest,
        3 // reset attempts for next beat
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
        remaining // save remaining attempts
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
          3 // reset to 3 for retry
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
    setMode(tab);
    stopPlayback();
    if (tab === "target") {
      playTargetGrid();
    }
  };

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
              className={`p-4 rounded-lg shadow transition-colors ${
                isPlaying
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
              title={isPlaying ? "Stop" : "Play"}
            >
              {isPlaying ? (
                <Square className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7" />
              )}
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
              className="p-4 bg-green-600 hover:bg-green-500 rounded-lg shadow transition-colors"
              title="Submit Guess"
            >
              <Zap className="w-7 h-7" />
            </button>
            <button
              onClick={clearGrid}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow"
              title="Clear"
            >
              <Trash2 className="w-7 h-7" />
            </button>
          </div>
        )}
        <footer className="mt-6 text-gray-500 text-xs font-mono w-full text-center">
          © {new Date().getFullYear()} Junkerri
        </footer>
        {/* Drum machine lights/knobs for realism */}
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

      <div className="mt-4 w-full max-w-md bg-gray-800 p-3 rounded-lg text-sm space-y-1">
        <h2 className="text-base font-bold text-white font-mono mb-1">Stats</h2>
        <p className="text-gray-300 font-mono">
          Beats Completed: {beatsCompleted}
        </p>
        <p className="text-gray-300 font-mono">
          Perfect Solves: {perfectSolves}
        </p>
        <p className="text-gray-300 font-mono">Highest Score: {highestScore}</p>
      </div>

      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          {gameOver && (
            <>
              <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
                👻 GAME OVER 👻
              </div>
              <p className="text-yellow-400 font-mono text-lg">
                ⭐ Score: {score}
              </p>
              <SequencerGrid
                grid={targetGrid}
                toggleStep={() => {}}
                activeStep={activeStep}
              />

              <button
                onClick={resetGame}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
              >
                <Repeat size={18} className="text-white" />
                <span>Retry This Beat</span>
              </button>
            </>
          )}
          {gameWon && (
            <>
              <div className="text-green-400 text-4xl font-extrabold animate-pulse font-mono">
                🎉 CONGRATULATIONS! 🎉
              </div>
              <p className="text-yellow-400 font-mono text-lg">
                ⭐ Score: {score}
              </p>
              <SequencerGrid
                grid={targetGrid}
                toggleStep={() => {}}
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
