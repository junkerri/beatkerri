"use client";

import React from "react";
import {
  Repeat,
  Share2,
  Headphones,
  Crosshair,
  Trophy,
  Clock,
  HelpCircle,
  ChevronDown,
  Copy,
  Facebook,
  AtSign,
  MessageCircle,
  Mail,
} from "lucide-react";
import Confetti from "react-confetti";
import { playSubmitClick } from "@/utils/clickSounds";
import Link from "next/link";
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
  alreadyPlayed?: boolean;
  timeUntilNextBeat?: string;
  totalAttempts?: number;
  
  // Share dropdown functions
  shareWithNativeAPI?: () => void;
  onCopyShareLink?: () => void;
  onShareToX?: () => void;
  onShareToFacebook?: () => void;
  onShareToThreads?: () => void;
  onShareToMessages?: () => void;
  onShareToWhatsApp?: () => void;
  onShareToEmail?: () => void;
  // Stats (optional)
  score?: number;
  highestScore?: number;
  beatsCompleted?: number;
  perfectSolves?: number;

  // Jam mode share functionality
  showJamShare?: boolean;
  jamShareMenuOpen?: boolean;
  onToggleJamShareMenu?: () => void;
  onJamCopyShareLink?: () => void;
  onJamShareToX?: () => void;
  onJamShareToFacebook?: () => void;
  onJamShareToWhatsApp?: () => void;
  onJamShareToEmail?: () => void;
  onJamShareToInstagram?: () => void;
  jamShareMenuRef?: React.RefObject<HTMLDivElement>;
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
  alreadyPlayed,
  timeUntilNextBeat,
  totalAttempts,
  score,
  highestScore,
  beatsCompleted,
  perfectSolves,
  currentPlayMode,
  onTogglePlayMode,
  // Jam mode share props
  showJamShare,
  jamShareMenuOpen,
  onToggleJamShareMenu,
  onJamCopyShareLink,
  onJamShareToX,
  onJamShareToFacebook,
  onJamShareToWhatsApp,
  onJamShareToEmail,
  onJamShareToInstagram,
  jamShareMenuRef,
  // Share dropdown functions
  shareWithNativeAPI,
  onCopyShareLink,
  onShareToX,
  onShareToFacebook,
  onShareToThreads,
  onShareToMessages,
  onShareToWhatsApp,
  onShareToEmail,
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
                <Crosshair className="inline w-4 h-4 mr-1" />
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
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-2 sm:p-4">
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
          p-3 sm:p-6
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
            // Jam mode share props
            showShare={showJamShare}
            shareMenuOpen={jamShareMenuOpen}
            onToggleShareMenu={onToggleJamShareMenu}
            onCopyShareLink={onJamCopyShareLink}
            onShareToX={onJamShareToX}
            onShareToFacebook={onJamShareToFacebook}
            onShareToWhatsApp={onJamShareToWhatsApp}
            onShareToEmail={onJamShareToEmail}
            onShareToInstagram={onJamShareToInstagram}
            shareMenuRef={jamShareMenuRef}
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
        <div className="absolute bottom-2 right-2">
          <Link
            href="/how-to-play#beatdle-mode"
            className="w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-300 border-2 border-gray-900 flex items-center justify-center transition-colors shadow-lg"
            onClick={() => playSubmitClick()}
            title="How To Play Beatdle Mode"
          >
            <HelpCircle size={16} className="text-gray-900" />
          </Link>
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-start space-y-4 overflow-y-auto p-4 pt-8 pb-8">
          {gameOver && (
            <>
              <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center flex-shrink-0">
                <div className="ghost-animation">
                  <div className="ghost-body">
                    <div className="ghost-eyes">
                      <div className="ghost-eye"></div>
                      <div className="ghost-eye"></div>
                    </div>
                    <div className="ghost-mouth"></div>
                  </div>
                </div>
              </div>
              <div className="text-red-500 text-4xl font-extrabold animate-pulse font-mono">
                GAME OVER
              </div>
              <p className="text-yellow-400 font-mono text-lg">
                {(mode === "beatdle" || mode === "challenge") &&
                  totalAttempts && (
                    <span className="mr-2 text-2xl">
                      {getAttemptEmoji(totalAttempts, gameWon)}
                    </span>
                  )}
                Final Score: {score}
              </p>
              {(mode === "beatdle" || mode === "challenge") &&
                totalAttempts && (
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
                    <Crosshair className="inline w-4 h-4 mr-1" />
                    Solution
                  </p>
                </div>
              )}

              {/* Listen and action buttons for game over */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
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
                {mode === "beatdle" && onShare && (
                  <div className="relative" ref={jamShareMenuRef}>
                    <button
                      onClick={onShare}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
                    >
                      <Share2 size={18} className="text-white" />
                      <span>Share Results</span>
                      {showShareMenu !== undefined && (
                        <ChevronDown
                          size={16}
                          className={`text-white transition-transform ${
                            showShareMenu ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {showShareMenu && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {typeof navigator !== "undefined" &&
                            typeof navigator.share === "function" && (
                              <button
                                onClick={shareWithNativeAPI}
                                className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                              >
                                <Share2 size={16} />
                                Share (Native)
                              </button>
                            )}
                          <button
                            onClick={onCopyShareLink}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <Copy size={16} />
                            Copy Link
                          </button>
                          <button
                            onClick={onShareToX}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <span className="text-lg font-bold">𝕏</span>X
                          </button>
                          <button
                            onClick={onShareToFacebook}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <Facebook size={16} />
                            Facebook
                          </button>
                          <button
                            onClick={onShareToThreads}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <AtSign size={16} />
                            Threads
                          </button>
                          <button
                            onClick={onShareToMessages}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <MessageCircle size={16} />
                            Messages
                          </button>
                          <button
                            onClick={onShareToWhatsApp}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <span className="text-lg">💬</span>
                            WhatsApp
                          </button>
                          <button
                            onClick={onShareToEmail}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <Mail size={16} />
                            Email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded flex items-center justify-center space-x-2 w-full sm:w-auto max-w-xs"
                >
                  <Repeat size={18} />
                  <span>Retry</span>
                </button>
              )}
            </>
          )}

          {gameWon && (
            <>
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={100}
              />
              <div className="text-green-400 text-4xl font-extrabold animate-pulse font-mono">
                CONGRATULATIONS!
              </div>
              <p className="text-yellow-400 font-mono text-lg">
                {(mode === "beatdle" || mode === "challenge") &&
                  totalAttempts && (
                    <span className="mr-2 text-2xl">
                      {getAttemptEmoji(totalAttempts, gameWon)}
                    </span>
                  )}
                <Trophy className="inline w-5 h-5 mr-2" />
                You scored {score} points!
              </p>
              {(mode === "beatdle" || mode === "challenge") &&
                totalAttempts && (
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
                    <Crosshair className="inline w-4 h-4 mr-1" />
                    Solution
                  </p>
                </div>
              )}

              {/* Listen and action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
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
                {mode === "beatdle" && onShare && (
                  <div className="relative" ref={jamShareMenuRef}>
                    <button
                      onClick={onShare}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-2 transition-colors"
                    >
                      <Share2 size={18} className="text-white" />
                      <span>Share Results</span>
                      {showShareMenu !== undefined && (
                        <ChevronDown
                          size={16}
                          className={`text-white transition-transform ${
                            showShareMenu ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {showShareMenu && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {typeof navigator !== "undefined" &&
                            typeof navigator.share === "function" && (
                              <button
                                onClick={shareWithNativeAPI}
                                className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                              >
                                <Share2 size={16} />
                                Share (Native)
                              </button>
                            )}
                          <button
                            onClick={onCopyShareLink}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <Copy size={16} />
                            Copy Link
                          </button>
                          <button
                            onClick={onShareToX}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <span className="text-lg font-bold">𝕏</span>X
                          </button>
                          <button
                            onClick={onShareToFacebook}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <Facebook size={16} />
                            Facebook
                          </button>
                          <button
                            onClick={onShareToThreads}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <AtSign size={16} />
                            Threads
                          </button>
                          <button
                            onClick={onShareToMessages}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <MessageCircle size={16} />
                            Messages
                          </button>
                          <button
                            onClick={onShareToWhatsApp}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <span className="text-lg">💬</span>
                            WhatsApp
                          </button>
                          <button
                            onClick={onShareToEmail}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                          >
                            <Mail size={16} />
                            Email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {onNextBeat && (
                <button
                  onClick={onNextBeat}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded animate-bounce w-full sm:w-auto max-w-xs"
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
