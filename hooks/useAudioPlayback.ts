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

  useEffect(() => {
    padPlayers.current = createPadPlayers();
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

      const players = createPlayers();

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
  };
};
