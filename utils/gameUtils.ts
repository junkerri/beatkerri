import * as Tone from "tone";

export const createEmptyGrid = () =>
  Array(7)
    .fill(null)
    .map(() => Array(16).fill(false));

export const instruments = [
  "kick",
  "snare",
  "closed_hihat",
  "open_hihat",
  "low_tom",
  "high_tom",
  "clap",
] as const;

export const instrumentNames = ["BD", "SN", "HH", "OH", "LT", "HT", "CL"];

export const createPadPlayers = () => {
  return new Tone.Players({
    kick: "/samples/kick.wav",
    snare: "/samples/snare.wav",
    closed_hihat: "/samples/closed_hihat.wav",
    open_hihat: "/samples/open_hihat.wav",
    clap: "/samples/clap.wav",
    low_tom: "/samples/low_tom.wav",
    high_tom: "/samples/high_tom.wav",
  }).toDestination();
};

export const createPlayers = () => {
  return new Tone.Players({
    kick: "/samples/kick.wav",
    snare: "/samples/snare.wav",
    closed_hihat: "/samples/closed_hihat.wav",
    open_hihat: "/samples/open_hihat.wav",
    clap: "/samples/clap.wav",
    low_tom: "/samples/low_tom.wav",
    high_tom: "/samples/high_tom.wav",
  }).toDestination();
};

export type Feedback = "correct" | "incorrect" | null;
export type PlayMode = "target" | "recreate";
export type GameMode = "challenge" | "beatdle" | "jam";
