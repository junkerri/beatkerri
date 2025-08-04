import type { Metadata } from "next";
import ChallengeComponent from "@/components/ChallengeComponent";

export const metadata: Metadata = {
  title:
    "Challenge Mode - Music Puzzle Game with Progressive Difficulty | BeatKerri",
  description:
    "Take on progressive music puzzle challenges! Start with simple beats and unlock new instruments as you master rhythm patterns. Free online music challenge game.",
  keywords: [
    "music challenge game",
    "progressive music puzzle",
    "rhythm challenge",
    "music training game",
    "beat making challenge",
    "music puzzle levels",
    "rhythm training",
    "online music challenge",
    "drum pattern challenge",
    "beat matching challenge",
  ],
  alternates: {
    canonical: "/challenge",
  },
};

export default function ChallengePage() {
  return <ChallengeComponent />;
}
