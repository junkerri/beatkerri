import { useState, useRef, useEffect, useCallback } from "react";
import * as Tone from "tone";
import {
  instruments,
  createPadPlayers,
  createPlayers,
} from "@/utils/gameUtils";

interface UseAudioPlaybackProps {
  bpm: number;
  isLooping: boolean;
}

export const useAudioPlayback = ({ bpm, isLooping }: UseAudioPlaybackProps) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const padPlayers = useRef<Tone.Players | null>(null);
  const currentPattern = useRef<boolean[][]>([]);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const playersRef = useRef<Tone.Players | null>(null);

  useEffect(() => {
    padPlayers.current = createPadPlayers();
  }, []);

  // Update the current pattern reference when it changes
  const updatePattern = useCallback((pattern: boolean[][]) => {
    currentPattern.current = pattern;
  }, []);

  const playPattern = useCallback(
    async (
      pattern: boolean[][],
      loop: boolean = isLooping,
      onDone?: () => void
    ) => {
      await Tone.start();
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.bpm.value = bpm;

      // Store the pattern reference for real-time updates
      currentPattern.current = pattern;

      // Create players and store reference
      playersRef.current = createPlayers();

      const seq = new Tone.Sequence(
        (time, col) => {
          setActiveStep(col);
          // Use the current pattern reference for real-time updates
          const currentGrid = currentPattern.current;
          currentGrid.forEach((row, rowIndex) => {
            if (row[col]) {
              playersRef.current?.player(instruments[rowIndex]).start(time);
            }
          });
        },
        [...Array(16).keys()],
        "16n"
      );

      seq.loop = loop;
      sequenceRef.current = seq;

      // Start the sequence with a small delay to ensure proper initialization
      seq.start("+0.1", 0);

      // Start transport with a slightly longer delay to ensure sequence is ready
      Tone.Transport.start("+0.2");

      if (!loop) {
        Tone.Transport.scheduleOnce(() => {
          setIsPlaying(false);
          setActiveStep(null);
          if (onDone) onDone();
        }, `+${(16 * 60) / bpm}s`);
      }
    },
    [bpm, isLooping]
  );

  const stopPlayback = useCallback(() => {
    // Stop transport immediately
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Stop all scheduled events
    Tone.Transport.clear();

    // Stop any currently playing sequences
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
    }

    // Clear references
    sequenceRef.current = null;
    playersRef.current = null;

    // Reset state
    setActiveStep(null);
    setIsPlaying(false);
  }, []);

  const playStep = useCallback(async (row: number) => {
    await Tone.start();
    padPlayers.current?.player(instruments[row]).start();
  }, []);

  return {
    activeStep,
    isPlaying,
    setIsPlaying,
    playPattern,
    stopPlayback,
    playStep,
    updatePattern, // New function to update pattern in real-time
  };
};
