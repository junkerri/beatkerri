"use client";

import { useState, useRef } from "react";
import { SequencerGrid } from "../components/SequencerGrid";

export default function Home() {
  const createEmptyGrid = () =>
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(false));

  const createTargetGrid = () => {
    const grid = createEmptyGrid();
    const quarterBeats = [0, 4, 8, 12];
    const usedColumns: number[] = [];
    let totalNotes = 0;

    while (totalNotes < 8) {
      const col = quarterBeats[Math.floor(Math.random() * quarterBeats.length)];
      if (usedColumns.includes(col)) continue;
      const row = Math.floor(Math.random() * 3); // Kick, Snare, Closed HH
      grid[row][col] = true;
      usedColumns.push(col);
      totalNotes++;
    }
    return grid;
  };

  const [grid, setGrid] = useState(createEmptyGrid());
  const [targetGrid] = useState(createTargetGrid());
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"recreate" | "target">("recreate");

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
    const newGrid = grid.map((r, i) =>
      i === row ? r.map((s, j) => (j === col ? !s : s)) : r
    );
    setGrid(newGrid);

    await ensurePadPlayers();
    padPlayers.current?.player(instruments[row]).start();
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
    setIsPlaying(true);

    setTimeout(() => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      setActiveStep(null);
      setIsPlaying(false);
    }, 4000);
  };

  const playGrid = () => playPattern(grid);
  const playTargetGrid = () => playPattern(targetGrid);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4 font-mono">BeatKerri: Listen and Recreate</h1>

      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setMode("target")}
          className={`px-4 py-2 rounded ${mode === "target" ? "bg-purple-600" : "bg-gray-700"}`}
        >
          🎵 Target Beat
        </button>
        <button
          onClick={() => setMode("recreate")}
          className={`px-4 py-2 rounded ${mode === "recreate" ? "bg-green-600" : "bg-gray-700"}`}
        >
          ✨ Recreate
        </button>
      </div>

      <SequencerGrid
        grid={grid}
        toggleStep={toggleStep}
        activeStep={activeStep}
      />

      <div className="flex space-x-2 mt-4">
        {mode === "target" ? (
          <button
            onClick={playTargetGrid}
            disabled={isPlaying}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            ▶ Play Target
          </button>
        ) : (
          <button
            onClick={playGrid}
            disabled={isPlaying}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            ▶ Play My Pattern
          </button>
        )}
      </div>
    </main>
  );
}
