import type { Metadata } from "next";
import JamModeComponent from "@/components/JamModeComponent";

export const metadata: Metadata = {
  title: "Jam Mode - Free Online Beat Maker & Music Sequencer | BeatKerri",
  description:
    "Create your own beats with our free online drum machine! Make music, export MIDI & WAV files, and unleash your creativity. No download required - start making beats now!",
  keywords: [
    "free beat maker",
    "online drum machine",
    "music sequencer",
    "beat making",
    "online music maker",
    "free music creation",
    "drum sequencer",
    "beat production",
    "music creation tool",
    "online beat maker",
    "MIDI export",
    "WAV export",
  ],
  alternates: {
    canonical: "/jam",
  },
};

export default function JamPage() {
  return <JamModeComponent />;
}
