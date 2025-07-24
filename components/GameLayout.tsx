"use client";

import {
  Play,
  Square,
  Repeat,
  Trash2,
  Send,
  Crosshair,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { SequencerGrid } from "./SequencerGrid";

type Feedback = "correct" | "incorrect" | null;

interface GameLayoutProps {
  title?: string;
  mode: "challenge" | "beatdle" | "jam";
  beatLabel: string;
  bpm: number;
  grid: boolean[][];
  targetGrid?: boolean[][];
  feedbackGrid?: Feedback[][];
  activeStep: number | null;
  isLooping: boolean;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  attemptsLeft?: number;
  stopPlayback: () => void;
  currentPlayMode: "target" | "recreate";
  onTogglePlayMode: (mode: "target" | "recreate") => void;

  // Controls
  onToggleStep: (row: number, col: number) => void;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onSubmitGuess?: () => void;
  onClearGrid: () => void;
  onNextBeat?: () => void;
  onRetry?: () => void;
  playGrid: () => void;
  playTargetGrid: () => void;

  // Stats (optional)
  score?: number;
  highestScore?: number;
  beatsCompleted?: number;
  perfectSolves?: number;
}

export const GameLayout = ({
  title,
  mode,
  beatLabel,
  bpm,
  grid,
  targetGrid,
  feedbackGrid,
  activeStep,
  isLooping,
  isPlaying,
  gameOver,
  gameWon,
  attemptsLeft,
  onToggleStep,
  onTogglePlay,
  onToggleLoop,
  onSubmitGuess,
  onClearGrid,
  onNextBeat,
  onRetry,
  playGrid,
  playTargetGrid,
  score,
  highestScore,
  beatsCompleted,
  perfectSolves,
  currentPlayMode,
  onTogglePlayMode,
}: GameLayoutProps) => {
  const [activeTab, setActiveTab] = useState<"target" | "recreate">("recreate");

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case "challenge":
        return "BEATKERRI 303";
      case "beatdle":
        return "🧩 Beatdle";
      case "jam":
        return "🎛️ Jam Mode";
      default:
        return "Beatkerri";
    }
  };

  const handlePlayTarget = () => {
    playTargetGrid();
    setActiveTab("target");
  };

  const handlePlayGrid = () => {
    playGrid();
    setActiveTab("recreate");
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {title && (
        <h2 className="text-xl font-bold font-mono mb-4 text-center">
          {title}
        </h2>
      )}

      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        {mode === "jam"
          ? "🎛️ Jam Mode: Create your own groove!"
          : "🎧 Listen to the target beat and recreate it."}
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 inline-block shadow-lg w-full max-w-2xl">
        <h1 className="text-xl font-bold mb-2 font-mono text-center tracking-widest">
          {getModeTitle(mode)}
        </h1>

        <p className="text-gray-400 font-mono text-center mb-2">{beatLabel}</p>

        {/* BPM + Stats */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2 w-full">
          <div className="flex flex-wrap gap-2 items-center justify-end">
            <div className="text-xs font-mono text-gray-400">
              BPM
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 rounded min-w-[2rem] text-center">
                {bpm}
              </span>
            </div>

            {mode !== "jam" && score !== undefined && (
              <>
                <div className="text-xs font-mono text-gray-400">
                  SCORE
                  <span className="ml-1 px-2 py-0.5 bg-black border border-gray-700 text-red-500 rounded min-w-[2rem] text-center">
                    {score}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  ATTEMPTS
                  <span className="ml-1 px-2 py-0.5 bg-black border border-gray-700 text-red-500 rounded min-w-[2rem] text-center">
                    {attemptsLeft}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recreate vs Target Toggle */}
        {mode !== "jam" && (
          <div className="flex justify-center space-x-2 mb-2">
            <button
              onClick={() => onTogglePlayMode("target")}
              className={`px-4 py-1 rounded font-mono text-sm ${
                currentPlayMode === "target"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              🎯 Target Beat
            </button>
            <button
              onClick={() => onTogglePlayMode("recreate")}
              className={`px-4 py-1 rounded font-mono text-sm ${
                currentPlayMode === "recreate"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              ✏️ Recreate Beat
            </button>
          </div>
        )}

        {/* Sequencer */}
        <SequencerGrid
          grid={grid}
          toggleStep={currentPlayMode === "recreate" ? onToggleStep : () => {}}
          feedbackGrid={feedbackGrid || undefined}
          activeStep={activeStep}
        />

        {/* Main Controls */}
        <div className="flex space-x-2 mt-4 justify-center">
          <button
            onClick={onTogglePlay}
            className={`p-4 rounded ${
              isPlaying
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            }`}
            title={isPlaying ? "Stop" : "Play"}
          >
            {isPlaying ? (
              <Square className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7" />
            )}
          </button>

          {onSubmitGuess && !gameOver && !gameWon && (
            <button
              onClick={onSubmitGuess}
              className="p-4 bg-blue-600 hover:bg-blue-500 rounded"
              title="Submit Guess"
            >
              <Send className="w-7 h-7" />
            </button>
          )}

          <button
            onClick={onToggleLoop}
            className={`p-4 rounded ${
              isLooping
                ? "bg-purple-600 hover:bg-purple-500"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title="Toggle Looping"
          >
            <Repeat className="w-7 h-7" />
          </button>

          <button
            onClick={onClearGrid}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded"
            title="Clear"
          >
            <Trash2 className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Stats for Challenge Mode */}
      {mode === "challenge" && beatsCompleted !== undefined && (
        <div className="mt-4 w-full max-w-md bg-gray-800 p-3 rounded-lg text-sm space-y-1">
          <h2 className="text-base font-bold text-white font-mono mb-1">
            Stats
          </h2>
          <p className="text-gray-300 font-mono">
            Beats Completed: {beatsCompleted}
          </p>
          <p className="text-gray-300 font-mono">
            Perfect Solves: {perfectSolves}
          </p>
          <p className="text-gray-300 font-mono">
            Highest Score: {highestScore}
          </p>
        </div>
      )}

      {/* Game Over / Victory */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          {gameOver && (
            <>
              <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
                👻 GAME OVER 👻
              </div>
              {targetGrid && (
                <SequencerGrid
                  grid={targetGrid}
                  toggleStep={() => {}}
                  activeStep={activeStep}
                />
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
                >
                  <Repeat size={18} />
                  <span>Retry</span>
                </button>
              )}
            </>
          )}

          {gameWon && (
            <>
              <div className="text-green-400 text-4xl font-extrabold animate-pulse font-mono">
                🎉 CONGRATULATIONS! 🎉
              </div>
              {targetGrid && (
                <SequencerGrid
                  grid={targetGrid}
                  toggleStep={() => {}}
                  activeStep={activeStep}
                />
              )}
              {onNextBeat && (
                <button
                  onClick={onNextBeat}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded animate-bounce"
                >
                  ✅ Next Beat
                </button>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
};
