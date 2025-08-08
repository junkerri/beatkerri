"use client";

import { useState, useEffect, useRef } from "react";
import seedrandom from "seedrandom";
import { GameLayout } from "@/components/GameLayout";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";
import { createEmptyGrid, PlayMode } from "@/utils/gameUtils";
import { getBeatForDate } from "../utils/customBeats";
import {
  Headphones,
  Clock,
  Share2,
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  ChevronDown,
  AtSign,
  Download,
  Music,
  Flame,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";
import { playToggleClick, playSubmitClick } from "@/utils/clickSounds";
import { useSoundscapes } from "@/hooks/useSoundscapes";
import { exportMidiFile, exportWavFile } from "@/utils/exportUtils";
import {
  updateStreakData,
  getStreakStatus,
  getStreakStats,
} from "@/utils/streakUtils";
import * as Tone from "tone";

const getTodayBeatNumber = () => {
  const epoch = new Date("2025-07-10"); // Initial commit date
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
  const targetNotes = 6 + Math.floor(rng() * 7); // 6–12 notes (max 12)

  // Ensure we always have a note on the first beat (column 0)
  const firstBeatRow = activeRows[Math.floor(rng() * activeRows.length)];
  grid[firstBeatRow][0] = true;
  let count = 1;

  // Track which columns already have notes to prevent stacking
  const usedColumns = new Set([0]);

  while (count < targetNotes) {
    const row = activeRows[Math.floor(rng() * activeRows.length)];
    const col = Math.floor(rng() * 16);

    // Only add note if this column doesn't already have a note (no stacking)
    if (!usedColumns.has(col)) {
      grid[row][col] = true;
      usedColumns.add(col);
      count++;
    }
  }

  return grid;
};

// Add attempt history for Wordle-style sharing
type Attempt = {
  grid: boolean[][];
  feedback: ("correct" | "incorrect" | null)[][];
};

export default function BeatdleMode() {
  const { playVictory, playLoss, stopAllImmediately } = useSoundscapes();

  const beatNumber = getTodayBeatNumber();
  const generatedBpm = getDailyBPM(beatNumber);
  const generatedGrid = createDailyPattern(beatNumber);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  console.log("📅 Today's date:", today, "Beat number:", beatNumber);

  // Get beat for today (custom or generated)
  const beatResult = getBeatForDate(today, generatedGrid, generatedBpm);
  const { grid: targetGrid, bpm, isCustom } = beatResult;

  // Debug: Log what we got from getBeatForDate
  console.log("🎵 Beat result from getBeatForDate:", {
    date: today,
    isCustom,
    targetGridLength: targetGrid?.flat().filter(Boolean).length,
    bpm,
    targetGridStructure: targetGrid?.map((row) => row.filter(Boolean).length),
    firstFewColumns: targetGrid?.map((row) => row.slice(0, 4)),
  });

  // If we're not getting a custom beat but we should have one, log more details
  if (!isCustom) {
    console.log(
      "Expected custom beat but got generated beat. Checking localStorage..."
    );
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("beatkerri_custom_beats");
        if (stored) {
          const storedBeats = JSON.parse(stored);
          const todayBeat = storedBeats.find(
            (b: { date: string }) => b.date === today
          );
          console.log("Today's beat in localStorage:", todayBeat);
        } else {
          console.log("No custom beats found in localStorage");
        }
      } catch (error) {
        console.error("Error checking localStorage:", error);
      }
    } else {
      console.log("Running on server-side, localStorage not available");
    }
  }

  // Safety check - ensure targetGrid is properly initialized
  let safeTargetGrid: boolean[][];
  let safeBpm: number;

  if (!targetGrid || !Array.isArray(targetGrid) || targetGrid.length !== 7) {
    console.error("targetGrid is not properly initialized:", targetGrid);
    // Fallback to generated grid if targetGrid is invalid
    safeTargetGrid = generatedGrid;
    safeBpm = generatedBpm;

    // Debug: Log the beat being used
    console.log("Beat for today (fallback):", {
      date: today,
      beatNumber,
      targetGrid: safeTargetGrid.flat().filter(Boolean).length,
      bpm: safeBpm,
      isCustom: false,
    });
  } else {
    safeTargetGrid = targetGrid;
    safeBpm = bpm;

    // Debug: Log the beat being used
    console.log("🎯 Beat for today (FINAL):", {
      date: today,
      beatNumber,
      targetGrid: safeTargetGrid.flat().filter(Boolean).length,
      bpm: safeBpm,
      isCustom: isCustom,
      firstRow: safeTargetGrid[0].slice(0, 8),
      secondRow: safeTargetGrid[1].slice(0, 8),
      thirdRow: safeTargetGrid[2].slice(0, 8),
    });
  }

  const [mode, setMode] = useState<PlayMode>("recreate");
  const [isLooping, setIsLooping] = useState(true);
  const [attemptHistory, setAttemptHistory] = useState<Attempt[]>([]);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [isTargetPlaying, setIsTargetPlaying] = useState(false);

  // Additional state for Beatdle mode
  const [beatsCompleted, setBeatsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [perfectSolves, setPerfectSolves] = useState(0);

  // Streak tracking state
  const [streakData, setStreakData] = useState(() => getStreakStatus());
  const [streakStats, setStreakStats] = useState(() => getStreakStats());

  // Use shared hooks
  const {
    activeStep,
    isPlaying,
    setIsPlaying,
    playPattern: playPatternAudio,
    stopPlayback: stopPlaybackAudio,
    playStep,
    updatePattern, // Add the new updatePattern function
  } = useAudioPlayback({ bpm: safeBpm, isLooping });

  // Stop target beat when component unmounts
  useEffect(() => {
    return () => {
      // Force stop all audio when component unmounts
      stopPlaybackAudio();
      setIsTargetPlaying(false);
      stopAllImmediately();

      // Force stop Tone.js transport
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [stopPlaybackAudio, stopAllImmediately]);

  const {
    grid,
    feedbackGrid,
    score,
    highestScore,
    attemptsLeft,
    gameWon,
    gameOver,
    claimedCorrectSteps,
    setFeedbackGrid,
    setScore,
    setHighestScore,
    setAttemptsLeft,
    setGameWon,
    setGameOver,
    setClaimedCorrectSteps,
    toggleStep: toggleStepGrid,
    clearGrid,
  } = useGameState({
    onGridChange: updatePattern, // Connect the real-time update callback
  });

  // Load streak data when component mounts
  useEffect(() => {
    setStreakData(getStreakStatus());
    setStreakStats(getStreakStats());
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
  }, [
    beatNumber,
    setScore,
    setHighestScore,
    setBeatsCompleted,
    setTotalAttempts,
    setPerfectSolves,
    setGameWon,
    setGameOver,
  ]);

  // Cleanup soundscapes on unmount and when game state changes
  useEffect(() => {
    return () => {
      stopAllImmediately();
    };
  }, [stopAllImmediately]);

  // Stop all soundscapes when component unmounts
  useEffect(() => {
    return () => {
      stopAllImmediately();
    };
  }, [stopAllImmediately]);

  const togglePlay = async () => {
    if (isPlaying) {
      stopPlaybackAudio();
      setIsPlaying(false);
    } else {
      if (mode === "target") {
        await playPatternAudio(safeTargetGrid);
      } else {
        await playPatternAudio(grid);
      }
      setIsPlaying(true);
    }
  };

  const toggleStep = async (row: number, col: number) => {
    if (mode === "recreate") {
      toggleStepGrid(row, col);
      await playStep(row);
    }
  };

  const handleTabClick = (tab: PlayMode) => {
    playToggleClick();
    setMode(tab);
    stopPlaybackAudio();
    if (tab === "target") {
      playPatternAudio(safeTargetGrid);
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

  // Wordle-style share logic - show only the number of notes in the target beat
  function getShareRow(grid: boolean[][]) {
    // Count total notes in the target beat
    const targetNoteCount = targetGrid.flat().filter(Boolean).length;

    // Create array of the same length as target notes
    return Array(targetNoteCount)
      .fill(0)
      .map((_, noteIndex) => {
        // Find target notes ordered by column position (left to right)
        const targetNotes = [];
        for (let col = 0; col < 16; col++) {
          for (let row = 0; row < 7; row++) {
            if (safeTargetGrid[row][col]) {
              targetNotes.push({ row, col, position: row * 16 + col });
            }
          }
        }

        // Get the nth target note (ordered by column)
        if (noteIndex >= targetNotes.length) return "🟥"; // Shouldn't happen, but show red
        const targetNote = targetNotes[noteIndex];

        // Check if user placed a note at this target position
        const userPlacedNote = grid[targetNote.row][targetNote.col];

        // Simple logic: if user placed a note in target position, it's green, otherwise red
        if (userPlacedNote && safeTargetGrid[targetNote.row][targetNote.col]) {
          return "🟩"; // User correctly placed a note in target position
        } else {
          return "🟥"; // User either didn't place a note or placed it in wrong position (red for better visibility)
        }
      })
      .join("");
  }

  // Get attempt emoji for sharing
  function getAttemptEmoji(attempts: number, gameWon: boolean) {
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
  }

  // Visual squares for overlay
  function getShareText() {
    const solved = gameWon;
    const attemptsUsed = attemptHistory.length;
    const maxAttempts = 3;
    const attemptStr = solved
      ? `${attemptsUsed}/${maxAttempts}`
      : `X/${maxAttempts}`;
    const attemptEmoji = getAttemptEmoji(attemptsUsed, gameWon);
    const header = `Beatdle #${beatNumber} ${attemptStr} ${attemptEmoji} 🎧`;
    // All attempts' colored squares, each on a new line
    const rows = attemptHistory.map((a) => getShareRow(a.grid)).join("\n");
    return `${header}\n${rows}\nScore: ${score}\nCan you beat it?\nhttps://beatkerri.com/`;
  }

  // Share menu/modal state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Export menu state
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareMenu]);

  const copyShareLink = async () => {
    const text = getShareText();

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
      setShowShareMenu(false);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const shareToX = async () => {
    const text = getShareText();
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;

    window.open(xUrl, "_blank");
    toast.success("Sharing to X!");
    setShowShareMenu(false);
  };

  const shareToFacebook = async () => {
    const text = getShareText();
    // Facebook doesn't support quote parameter reliably, so we'll copy to clipboard and open Facebook
    try {
      await navigator.clipboard.writeText(text);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        "https://beatkerri.com/beatdle"
      )}`;
      window.open(facebookUrl, "_blank");
      toast.success(
        "Results copied to clipboard! Paste into your Facebook post.",
        {
          duration: 6000,
          style: { maxWidth: "400px" },
        }
      );
    } catch {
      // Fallback: just open Facebook
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        "https://beatkerri.com/beatdle"
      )}`;
      window.open(facebookUrl, "_blank");
      toast("Copy your results manually and paste into Facebook!", {
        duration: 5000,
        style: { maxWidth: "400px" },
      });
    }
    setShowShareMenu(false);
  };

  const shareToWhatsApp = async () => {
    const text = getShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank");
    toast.success("Sharing to WhatsApp!");
    setShowShareMenu(false);
  };

  const shareToEmail = async () => {
    const text = getShareText();

    const subject = `🎵 Check out my Beatdle #${beatNumber} result!`;
    const body = `${text}\n\nI just played today's Beatdle challenge!\n\nTry Beatdle - the daily music puzzle game!\nhttps://beatkerri.com/beatdle`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    toast.success("Opening email to share results!");
    setShowShareMenu(false);
  };

  const shareToMessages = async () => {
    const text = getShareText();
    const smsText = `${text}\n\nTry Beatdle - the daily music puzzle! https://beatkerri.com/beatdle`;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      const smsUrl = `sms:?body=${encodeURIComponent(smsText)}`;
      window.location.href = smsUrl;
      toast.success("Opening Messages!");
    } else {
      try {
        await navigator.clipboard.writeText(smsText);
        toast.success("Results copied! Paste in your messaging app.");
      } catch {
        toast.error("Please copy manually on desktop");
      }
    }
    setShowShareMenu(false);
  };

  const shareToThreads = async () => {
    const text = getShareText();

    // Always copy to clipboard first for best emoji compatibility
    try {
      await navigator.clipboard.writeText(text);
      // Open Threads without pre-filled text to avoid emoji encoding issues
      const threadsUrl = `https://threads.net/intent/post`;
      window.open(threadsUrl, "_blank");
      toast.success(
        "🟩🟥 Results copied! Paste into your Threads post for perfect squares.",
        {
          duration: 7000,
          style: { maxWidth: "450px" },
        }
      );
    } catch {
      // Manual copy fallback
      toast.error(
        "Please manually copy your results and paste into Threads for best emoji display!",
        {
          duration: 8000,
          style: { maxWidth: "450px" },
        }
      );
      // Still open Threads
      const threadsUrl = `https://threads.net/intent/post`;
      window.open(threadsUrl, "_blank");
    }
    setShowShareMenu(false);
  };

  const shareWithNativeAPI = async () => {
    const text = getShareText();
    const shareData = {
      title: `Beatdle #${beatNumber} Results`,
      text: text,
      url: "https://beatkerri.com/beatdle",
    };

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share(shareData);
        toast.success("Results shared!");
        setShowShareMenu(false);
      } catch {
        // User cancelled or error occurred
        setShowShareMenu(false);
      }
    } else {
      // Fallback to copy
      copyShareLink();
    }
  };

  const submitGuess = () => {
    // Safety check - ensure grid and targetGrid are properly initialized
    if (
      !grid ||
      !safeTargetGrid ||
      !Array.isArray(grid) ||
      !Array.isArray(safeTargetGrid)
    ) {
      console.error("Grid or targetGrid is not properly initialized:", {
        grid,
        targetGrid: safeTargetGrid,
      });
      return;
    }

    playSubmitClick();
    const newFeedback = grid.map((row, rowIndex) =>
      row.map((step, colIndex) => {
        if (step) {
          if (safeTargetGrid[rowIndex] && safeTargetGrid[rowIndex][colIndex]) {
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
          grid[rowIndex] &&
          grid[rowIndex][colIndex] &&
          safeTargetGrid[rowIndex] &&
          safeTargetGrid[rowIndex][colIndex]
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
    const targetNoteCount = safeTargetGrid.flat().filter(Boolean).length;
    const correctCount = grid.flat().filter((val, i) => {
      const row = Math.floor(i / 16);
      const col = i % 16;
      return val && safeTargetGrid[row] && safeTargetGrid[row][col];
    }).length;
    const remainingNotes = targetNoteCount - correctCount;

    let allCorrect = true;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 16; col++) {
        if (
          !grid[row] ||
          !safeTargetGrid[row] ||
          grid[row][col] !== safeTargetGrid[row][col]
        ) {
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
      setTotalAttempts(newTotalAttempts);
      setAttemptsLeft(attemptsLeft); // Ensure attempts are properly set
      const isPerfect = attemptsLeft === 3;
      if (isPerfect) {
        setPerfectSolves(perfectSolves + 1);
      }

      // Update streak data
      updateStreakData(
        beatNumber,
        true, // won
        totalScore,
        4 - attemptsLeft, // attempts used
        isPerfect
      );
      setStreakData(getStreakStatus());
      setStreakStats(getStreakStats());

      // Play victory soundscape
      playVictory("beatdle", isPerfect);
      saveProgress(
        beatNumber,
        totalScore,
        beatsCompleted + 1,
        newTotalAttempts,
        perfectSolves + (attemptsLeft === 3 ? 1 : 0),
        updatedHighest,
        attemptsLeft,
        true, // gameWon
        false // gameOver
      );

      stopPlaybackAudio();

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
        stopPlaybackAudio();

        // Update streak data for loss
        updateStreakData(
          beatNumber,
          false, // won
          totalScore,
          3, // used all attempts
          false // not perfect
        );
        setStreakData(getStreakStatus());
        setStreakStats(getStreakStats());

        // Play loss soundscape
        playLoss("beatdle");

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
      // Stop the target audio
      stopPlaybackAudio();
      setIsTargetPlaying(false);
      // Wait a moment for audio to fully stop before resuming soundscape
      setTimeout(() => {
        if (gameOver) {
          playLoss("beatdle");
        } else if (gameWon) {
          const isPerfect = attemptsLeft === 3;
          playVictory("beatdle", isPerfect);
        }
      }, 100);
    } else {
      // Stop any playing soundscape before playing target
      stopAllImmediately();
      setIsTargetPlaying(true);
      // Play target grid once (not looping)
      await playPatternAudio(safeTargetGrid, false, () => {
        setIsTargetPlaying(false);
        // Resume the appropriate soundscape after target finishes
        if (gameOver) {
          playLoss("beatdle");
        } else if (gameWon) {
          const isPerfect = attemptsLeft === 3;
          playVictory("beatdle", isPerfect);
        }
      });
    }
  };

  // Export handlers for already played screen
  const handleExportMidi = () => {
    const filename = `beatdle-${beatNumber}-${today}.mid`;
    exportMidiFile(safeTargetGrid, safeBpm, filename);
  };

  const handleExportWav = async () => {
    const filename = `beatdle-${beatNumber}-${today}.wav`;
    await exportWavFile(safeTargetGrid, safeBpm, filename);
  };

  // Combined share handler for game over/won overlays
  const handleCombinedShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  // Export menu handler
  const handleToggleExportMenu = () => {
    setExportMenuOpen(!exportMenuOpen);
  };

  // If already played, show message and block game UI
  if (alreadyPlayed) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-2 sm:p-4">
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-start space-y-6 overflow-y-auto p-4 pt-8 pb-8">
          <div className="text-4xl font-extrabold animate-pulse font-mono text-red-500">
            🕐 ALREADY PLAYED TODAY 🕐
          </div>

          {/* Final Score */}
          <p className="text-yellow-400 font-mono text-lg">
            Final Score: {score}
          </p>

          {/* Streak Display */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 max-w-md w-full">
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-white mb-2">Your Streak</h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Flame
                    className={`w-5 h-5 ${
                      streakData.isActive ? "text-orange-500" : "text-gray-500"
                    }`}
                  />
                  <span className="text-xl font-bold">
                    {streakData.currentStreak}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">
                    Best: {streakData.longestStreak}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="text-gray-400">Win Rate</div>
                <div className="font-bold text-green-400">
                  {streakStats.winRate}%
                </div>
              </div>
              <div>
                <div className="text-gray-400">Perfect</div>
                <div className="font-bold text-purple-400">
                  {streakStats.perfectRate}%
                </div>
              </div>
              <div>
                <div className="text-gray-400">Avg Score</div>
                <div className="font-bold text-blue-400">
                  {streakStats.averageScore.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg">
            <button
              onClick={toggleTargetBeat}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
              title="Listen to Today's Beat"
            >
              <Headphones size={18} className="text-white" />
              <span>Listen</span>
            </button>

            {/* Export Beat Button */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={handleToggleExportMenu}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded flex items-center justify-center space-x-2 transition-colors w-full"
              >
                <Download size={18} className="text-white" />
                <span>Export Beat</span>
                <ChevronDown
                  size={16}
                  className={`text-white transition-transform ${
                    exportMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {exportMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={handleExportMidi}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <Music size={16} />
                      Export as MIDI
                    </button>
                    <button
                      onClick={handleExportWav}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export as WAV
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share Results Button */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center space-x-2 transition-colors w-full"
              >
                <Share2 size={18} className="text-white" />
                <span>Share Results</span>
                <ChevronDown
                  size={16}
                  className={`text-white transition-transform ${
                    showShareMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showShareMenu && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
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
                      onClick={copyShareLink}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Copy Results
                    </button>
                    <button
                      onClick={shareToX}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <span className="text-lg font-bold">𝕏</span>X
                    </button>
                    <button
                      onClick={shareToFacebook}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <Facebook size={16} />
                      Facebook
                    </button>
                    <button
                      onClick={shareToThreads}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <AtSign size={16} />
                      Threads
                    </button>
                    <button
                      onClick={shareToMessages}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Messages
                    </button>
                    <button
                      onClick={shareToWhatsApp}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <span className="text-lg">💬</span>
                      WhatsApp
                    </button>
                    <button
                      onClick={shareToEmail}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Email
                    </button>
                  </div>
                </div>
              )}
            </div>
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

  // Create enhanced beat label with streak info
  const beatLabelWithStreak = `Beatdle #${beatNumber}${
    streakData.isActive && streakData.currentStreak > 0
      ? ` • ${streakData.currentStreak}🔥`
      : ""
  }`;

  return (
    <GameLayout
      mode="beatdle"
      beatLabel={beatLabelWithStreak}
      bpm={safeBpm}
      grid={grid}
      targetGrid={safeTargetGrid}
      feedbackGrid={feedbackGrid || undefined}
      activeStep={activeStep}
      isLooping={isLooping}
      isPlaying={isPlaying}
      gameOver={gameOver}
      gameWon={gameWon}
      attemptsLeft={attemptsLeft}
      currentPlayMode={mode}
      onTogglePlayMode={handleTabClick}
      onToggleStep={toggleStep}
      onTogglePlay={togglePlay}
      onToggleLoop={() => setIsLooping(!isLooping)}
      onSubmitGuess={submitGuess}
      onClearGrid={clearGrid}
      onListenTarget={toggleTargetBeat}
      onShare={handleCombinedShare}
      isTargetPlaying={isTargetPlaying}
      showShareMenu={showShareMenu}
      alreadyPlayed={alreadyPlayed}
      timeUntilNextBeat={getTimeUntilNextBeat()}
      totalAttempts={attemptHistory.length}
      score={score}
      highestScore={highestScore}
      // Share dropdown functions
      shareWithNativeAPI={shareWithNativeAPI}
      onCopyShareLink={copyShareLink}
      onShareToX={shareToX}
      onShareToFacebook={shareToFacebook}
      onShareToThreads={shareToThreads}
      onShareToMessages={shareToMessages}
      onShareToWhatsApp={shareToWhatsApp}
      onShareToEmail={shareToEmail}
      // Streak tracking props
      streakData={streakData}
      streakStats={streakStats}
      // Export function props
      onExportMidi={handleExportMidi}
      onExportWav={handleExportWav}
      showExportMenu={exportMenuOpen}
      onToggleExportMenu={handleToggleExportMenu}
    />
  );
}
