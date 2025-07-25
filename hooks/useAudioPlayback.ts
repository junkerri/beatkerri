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
      seq.start(undefined, 0);

      Tone.Transport.start("+0.1");

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
    Tone.Transport.stop();
    Tone.Transport.cancel();
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
