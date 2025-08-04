import type { Metadata } from "next";
import BeatdleMode from "@/components/BeatdleMode";

export const metadata: Metadata = {
  title: "Beatdle - Daily Music Puzzle Game | Free Online Daily Beat Challenge",
  description:
    "Play Beatdle, the daily music puzzle game! Listen to a beat and recreate it in 3 tries. New musical challenge every day. Free daily puzzle for music lovers and rhythm gamers.",
  keywords: [
    "daily puzzle",
    "music puzzle",
    "daily music puzzle",
    "music daily challenge",
    "daily rhythm puzzle",
    "beatdle",
    "music wordle",
    "daily beat challenge",
    "music guessing game",
    "rhythm puzzle game",
    "daily music game",
    "free daily puzzle",
    "online daily puzzle",
    "music pattern puzzle",
    "beat matching puzzle",
    "daily musical challenge",
    "puzzle game music",
    "daily puzzle game",
    "music puzzle daily",
    "rhythm daily puzzle",
  ],
  openGraph: {
    title: "Beatdle - Daily Music Puzzle Game | Free Daily Beat Challenge",
    description:
      "Play today's Beatdle! Listen to a beat and recreate it in 3 tries. New musical puzzle every day.",
    url: "https://beatkerri.com/beatdle",
    images: [
      {
        url: "/og-beatdle.png",
        width: 1200,
        height: 630,
        alt: "Beatdle - Daily Music Puzzle Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beatdle - Daily Music Puzzle Game",
    description:
      "Play today's musical puzzle! Listen to a beat and recreate it in 3 tries.",
  },
  alternates: {
    canonical: "/beatdle",
  },
};

export default function BeatdlePage() {
  return <BeatdleMode />;
}
