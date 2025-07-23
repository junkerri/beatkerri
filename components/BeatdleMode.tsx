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

export default function BeatdleMode() {
  const beatNumber = getTodayBeatNumber();
  const bpm = getDailyBPM(beatNumber);
  const targetGrid = createDailyPattern(beatNumber);

  const [grid, setGrid] = useState(createEmptyGrid());
  const [mode, setMode] = useState<"target" | "recreate">("recreate");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

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

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        🧩 Beatdle #{beatNumber} — Listen & Recreate
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-2xl">
        <div className="flex justify-between mb-3">
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

          <div className="text-xs font-mono text-gray-400">BPM {bpm}</div>
        </div>

        <SequencerGrid
          grid={grid}
          toggleStep={toggleStep}
          feedbackGrid={undefined}
          activeStep={activeStep}
        />

        {mode === "recreate" && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={togglePlay}
              className={`p-4 rounded ${
                isPlaying ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {isPlaying ? <Square /> : <Play />}
            </button>
            <button
              onClick={() => setIsLooping(!isLooping)}
              className="p-4 bg-purple-600 rounded"
            >
              <Repeat />
            </button>
            <button
              onClick={() => {
                setGrid(createEmptyGrid());
                stopPlayback();
              }}
              className="p-4 bg-gray-700 rounded"
            >
              <Trash2 />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
