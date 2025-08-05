import { useEffect, useState, useCallback } from "react";
import {
  soundscapeManager,
  playMainPageAmbient,
  playVictorySoundscape,
  playLossSoundscape,
  playGameStart,
  playModeSwitch,
  stopAllSoundscapes,
  stopAllSoundscapesImmediately,
} from "@/utils/soundscapeManager";

export const useSoundscapes = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize soundscapes on mount
  useEffect(() => {
    const initSoundscapes = async () => {
      try {
        await soundscapeManager.preloadSoundscapes();
        setIsLoaded(true);
      } catch (error) {
        console.warn("Failed to initialize soundscapes:", error);
      }
    };

    initSoundscapes();

    // Cleanup on unmount
    return () => {
      soundscapeManager.dispose();
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    setIsMuted(soundscapeManager.getMuteState());
  }, []);

  // Sync volume state
  useEffect(() => {
    setVolume(soundscapeManager.getVolume());
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    soundscapeManager.toggleMute();
    setIsMuted(soundscapeManager.getMuteState());
  }, []);

  // Set volume
  const updateVolume = useCallback((newVolume: number) => {
    soundscapeManager.setVolume(newVolume);
    setVolume(newVolume);
  }, []);

  // Play main page ambient music
  const playMainPage = useCallback(() => {
    if (!isMuted) {
      playMainPageAmbient();
    }
  }, [isMuted]);

  // Play victory soundscape
  const playVictory = useCallback(
    (mode: "beatdle" | "challenge", isPerfect: boolean = false) => {
      console.log(
        `🎵 useSoundscapes.playVictory called - mode: ${mode}, isPerfect: ${isPerfect}, isMuted: ${isMuted}`
      );
      if (!isMuted) {
        playVictorySoundscape(mode, isPerfect);
      } else {
        console.log("🔇 Victory music skipped - soundscapes are muted");
      }
    },
    [isMuted]
  );

  // Play loss soundscape
  const playLoss = useCallback(
    (mode: "beatdle" | "challenge") => {
      if (!isMuted) {
        playLossSoundscape(mode);
      }
    },
    [isMuted]
  );

  // Play game start transition
  const playStart = useCallback(() => {
    if (!isMuted) {
      playGameStart();
    }
  }, [isMuted]);

  // Play mode switch transition
  const playSwitch = useCallback(() => {
    if (!isMuted) {
      playModeSwitch();
    }
  }, [isMuted]);

  // Stop all soundscapes with fade
  const stopAll = useCallback(() => {
    stopAllSoundscapes();
  }, []);

  // Stop all soundscapes immediately (no fade)
  const stopAllImmediately = useCallback(() => {
    stopAllSoundscapesImmediately();
  }, []);

  return {
    // State
    isMuted,
    volume,
    isLoaded,

    // Controls
    toggleMute,
    updateVolume,

    // Play functions
    playMainPage,
    playVictory,
    playLoss,
    playStart,
    playSwitch,
    stopAll,
    stopAllImmediately,

    // Direct access to manager
    manager: soundscapeManager,
  };
};
