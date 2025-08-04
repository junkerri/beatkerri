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
    "shareable beats",
    "viral music",
    "instagram stories",
    "social sharing",
  ],
  openGraph: {
    title: "🎵 BeatKerri Jam Mode - Create & Share Beats",
    description:
      "Make beats with our 16-step sequencer! Create, share, and discover amazing drum patterns. Export as MIDI/WAV or share instantly with friends!",
    url: "/jam",
    siteName: "BeatKerri",
    images: [
      {
        url: "/og-jam-mode.png", // We'll need to create this image
        width: 1200,
        height: 630,
        alt: "BeatKerri Jam Mode - Online Beat Maker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🎵 BeatKerri Jam Mode - Create & Share Beats",
    description:
      "Make beats with our 16-step sequencer! Create, share, and discover amazing drum patterns.",
    images: ["/og-jam-mode.png"],
    creator: "@beatkerri",
    site: "@beatkerri",
  },
  alternates: {
    canonical: "/jam",
  },
};

export default function JamPage() {
  return <JamModeComponent />;
}
