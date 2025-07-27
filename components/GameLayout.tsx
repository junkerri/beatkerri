"use client";

import {
  Repeat,
  Trophy,
  Target,
  Headphones,
  Share2,
  Clock,
} from "lucide-react";
import { SequencerGrid } from "./SequencerGrid";
import { GameControls } from "./GameControls";
import { GameStats } from "./GameStats";
import { ModeToggle } from "./ModeToggle";
import { Feedback, PlayMode, GameMode } from "@/utils/gameUtils";

interface GameLayoutProps {
  title?: string;
  mode: GameMode;
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
  currentPlayMode: PlayMode;
  onTogglePlayMode: (mode: PlayMode) => void;

  // Controls
  onToggleStep: (row: number, col: number) => void;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onSubmitGuess?: () => void;
  onClearGrid: () => void;
  onNextBeat?: () => void;
  onRetry?: () => void;

  // Beatdle-specific features
  onListenTarget?: () => void;
  onShare?: () => void;
  isTargetPlaying?: boolean;
  showShareMenu?: boolean;
  onCloseShareMenu?: () => void;
  alreadyPlayed?: boolean;
  timeUntilNextBeat?: string;
  totalAttempts?: number;

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
  onListenTarget,
  onShare,
  isTargetPlaying,
  showShareMenu,
  onCloseShareMenu,
  alreadyPlayed,
  timeUntilNextBeat,
  totalAttempts,
  score,
  highestScore,
  beatsCompleted,
  perfectSolves,
  currentPlayMode,
  onTogglePlayMode,
}: GameLayoutProps) => {
  const getModeTitle = (mode: GameMode) => {
    switch (mode) {
      case "challenge":
        return "BEATKERRI 303";
      case "beatdle":
        return "BEATKERRI 303";
      case "jam":
        return "BEATKERRI 303";
      default:
        return "BEATKERRI 303";
    }
  };

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

  // If already played (Beatdle mode), show overlay
  if (alreadyPlayed) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl font-extrabold animate-pulse font-mono text-red-500">
            🕐 ALREADY PLAYED TODAY 🕐
          </div>
          <p className="text-yellow-400 font-mono text-lg">
            Final Score: {score}
          </p>

          {/* Solution Grid */}
          {targetGrid && (
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
          )}

          <div className="flex items-center gap-3">
            {onListenTarget && (
              <button
                onClick={onListenTarget}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
                title="Play Beat"
              >
                <Headphones size={18} className="text-white" />
                <span>Listen</span>
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
              >
                <Share2 size={18} className="text-white" />
                <span>Share Results</span>
              </button>
            )}
          </div>
          <p className="text-gray-400 font-mono text-center mt-4">
            Come back tomorrow for a new beat!
          </p>
          {timeUntilNextBeat && (
            <p className="text-gray-500 font-mono text-center text-xs flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              Next beat available in {timeUntilNextBeat}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {title && (
        <h2 className="text-xl font-bold font-mono mb-4 text-center">
          {title}
        </h2>
      )}

      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        {mode === "jam"
          ? "Jam Mode: Create your own groove!"
          : "Listen to the target beat and recreate it."}
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
          {getModeTitle(mode)}
        </h1>
        <p className="text-gray-400 font-mono text-center mb-2">{beatLabel}</p>

        {/* Stats */}
        <div className="flex justify-between mb-4 w-full">
          {mode !== "jam" && (
            <ModeToggle
              currentMode={currentPlayMode}
              onToggleMode={onTogglePlayMode}
              disabled={gameOver || gameWon}
            />
          )}
          <GameStats
            bpm={bpm}
            score={score}
            highestScore={highestScore}
            attemptsLeft={attemptsLeft}
          />
        </div>

        {/* Sequencer */}
        <div className="w-full mb-4">
          <SequencerGrid
            grid={grid}
            toggleStep={
              currentPlayMode === "recreate" ? onToggleStep : () => {}
            }
            feedbackGrid={feedbackGrid || undefined}
            activeStep={activeStep}
          />
        </div>

        {/* Controls */}
        {!gameOver && !gameWon && currentPlayMode === "recreate" && (
          <GameControls
            isPlaying={isPlaying}
            isLooping={isLooping}
            canSubmit={!!onSubmitGuess}
            onTogglePlay={onTogglePlay}
            onToggleLoop={onToggleLoop}
            onSubmitGuess={onSubmitGuess}
            onClearGrid={onClearGrid}
          />
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

      {/* Extended Stats for Challenge Mode */}
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

      {/* Game Over / Victory Overlay */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          {gameOver && (
            <>
              <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
                👻 GAME OVER 👻
              </div>
              <p className="text-yellow-400 font-mono text-lg">
                {mode === "beatdle" && totalAttempts && (
                  <span className="mr-2 text-2xl">
                    {getAttemptEmoji(totalAttempts, gameWon)}
                  </span>
                )}
                Final Score: {score}
              </p>
              {mode === "beatdle" && totalAttempts && (
                <p className="text-green-400 font-mono text-center">
                  {getAttemptMessage(totalAttempts, gameWon)}
                </p>
              )}
              {targetGrid && (
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
              )}

              {/* Beatdle-specific buttons for game over */}
              {mode === "beatdle" && (
                <div className="flex items-center gap-3">
                  {onListenTarget && (
                    <button
                      onClick={onListenTarget}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
                      title="Play Beat"
                    >
                      <Headphones size={22} className="text-white" />
                      <span>{isTargetPlaying ? "Stop" : "Listen"}</span>
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
                    >
                      <Share2 size={18} className="text-white" />
                      <span>Share Results</span>
                    </button>
                  )}
                </div>
              )}

              {/* Countdown timer for Beatdle mode */}
              {mode === "beatdle" && timeUntilNextBeat && (
                <p className="text-gray-500 font-mono text-center text-xs flex items-center justify-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Next beat available in {timeUntilNextBeat}
                </p>
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
              <p className="text-yellow-400 font-mono text-lg">
                {mode === "beatdle" && totalAttempts && (
                  <span className="mr-2 text-2xl">
                    {getAttemptEmoji(totalAttempts, gameWon)}
                  </span>
                )}
                <Trophy className="inline w-5 h-5 mr-2" />
                You scored {score} points!
              </p>
              {mode === "beatdle" && totalAttempts && (
                <p className="text-green-400 font-mono text-center">
                  {getAttemptMessage(totalAttempts, gameWon)}
                </p>
              )}
              {targetGrid && (
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
              )}

              {/* Beatdle-specific buttons */}
              {mode === "beatdle" && (
                <div className="flex items-center gap-3">
                  {onListenTarget && (
                    <button
                      onClick={onListenTarget}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center space-x-2 transition-colors"
                      title="Play Beat"
                    >
                      <Headphones size={22} className="text-white" />
                      <span>{isTargetPlaying ? "Stop" : "Listen"}</span>
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
                    >
                      <Share2 size={18} className="text-white" />
                      <span>Share Results</span>
                    </button>
                  )}
                </div>
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

      {/* Share Menu for Beatdle Mode */}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 flex flex-col gap-4 items-center w-80">
            <button
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=https://beatkerri.vercel.app/`,
                  "_blank"
                )
              }
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
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    "Check out my Beatdle score!"
                  )}`,
                  "_blank"
                )
              }
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
              onClick={() =>
                navigator.clipboard.writeText("Check out my Beatdle score!")
              }
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
            {onCloseShareMenu && (
              <button
                onClick={onCloseShareMenu}
                className="mt-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
