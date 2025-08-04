import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Beatdle - Daily Music Puzzle Game | Free Online Daily Beat Challenge",
  description:
    "Play Beatdle, the daily music puzzle game! New beat challenge every day - listen and recreate like Wordle for music. Free daily puzzle, rhythm training, and beat making. No download required!",
  keywords: [
    // Primary music game keywords
    "music puzzle game",
    "online music game",
    "free music game",
    "beat making game",
    "rhythm puzzle game",
    "music challenge game",
    "daily music puzzle",
    "beat matching game",
    "music sequencer game",
    "drum machine game",

    // Puzzle game keywords
    "puzzle game",
    "online puzzle game",
    "free puzzle game",
    "daily puzzle",
    "music puzzle",
    "rhythm puzzle",
    "beat puzzle",
    "sequencer puzzle",
    "pattern matching game",
    "logic puzzle game",

    // Music production keywords
    "beat making",
    "online beat maker",
    "free beat maker",
    "drum machine",
    "music sequencer",
    "rhythm training",
    "music creation",
    "beat production",
    "music technology",
    "audio synthesis",

    // Game-specific keywords
    "Beatdle",
    "daily music challenge",
    "music wordle",
    "beat wordle",
    "music guessing game",
    "rhythm guessing game",
    "music pattern game",
    "beat pattern game",
    "music recreation game",

    // Technical keywords
    "web audio game",
    "Tone.js game",
    "React music app",
    "interactive music",
    "real-time audio",
    "music web app",
    "browser music game",
    "no download music game",

    // Brand keywords
    "BeatKerri",
    "beat kerri",
    "junkerri",
    "junkerri art",
    "Aastha Karki",
    "Nepali artist",
    "music education",
    "creative music",
  ],
  authors: [{ name: "Aastha Karki", url: "https://junkerri.com" }],
  creator: "Aastha Karki (junkerri)",
  publisher: "Junkerri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://beatkerri.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Beatdle - Daily Music Puzzle Game | Free Online Daily Beat Challenge",
    description:
      "Play Beatdle, the daily music puzzle game! New beat challenge every day - listen and recreate like Wordle for music. Free daily puzzle, rhythm training, and beat making.",
    url: "https://beatkerri.com",
    siteName: "BeatKerri 303 by Junkerri",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BeatKerri 303 - Interactive Drum Machine Game by Junkerri",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Beatdle - Daily Music Puzzle Game | Free Online Daily Beat Challenge",
    description:
      "Play Beatdle, the daily music puzzle game! New beat challenge every day - listen and recreate like Wordle for music. Free daily puzzle, rhythm training, and beat making.",
    images: ["/og-image.png"],
    creator: "@junkerri",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  },
  category: "music",
  classification: "music game",
  other: {
    "application-name": "BeatKerri 303",
    "apple-mobile-web-app-title": "BeatKerri 303",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "theme-color": "#fbbf24",
    "color-scheme": "dark",
    "msapplication-TileColor": "#fbbf24",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enhanced structured data for SEO with puzzle game focus
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "BeatKerri 303",
      alternativeName: "Beatdle - Daily Music Puzzle",
      description:
        "Free online daily music puzzle game with beat challenges, rhythm training, and creative beat making. Play Beatdle - the daily music puzzle like Wordle but for beats!",
      url: "https://beatkerri.com",
      applicationCategory: ["MusicApplication", "Game", "PuzzleGame"],
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript and Web Audio API",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Free to play daily music puzzle game",
      },
      author: {
        "@type": "Person",
        name: "Aastha Karki",
        url: "https://junkerri.com",
        sameAs: ["https://junkerri.com"],
      },
      creator: {
        "@type": "Person",
        name: "Aastha Karki (junkerri)",
      },
      genre: [
        "Music Game",
        "Puzzle Game",
        "Rhythm Game",
        "Daily Puzzle",
        "Music Puzzle",
      ],
      keywords:
        "daily puzzle, music puzzle, daily music puzzle, beatdle, music wordle, daily beat challenge, rhythm puzzle game, online daily puzzle, free music puzzle, daily musical challenge",
      screenshot: "https://beatkerri.com/og-image.png",
      softwareVersion: "1.0.0",
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      featureList: [
        "Daily beat challenges - new puzzle every day",
        "Rhythm training and ear training",
        "Creative beat making and music sequencing",
        "Progressive difficulty levels",
        "Real-time audio synthesis",
        "MIDI and WAV export capabilities",
        "No download required - play in browser",
        "Free to play daily puzzle game",
        "Social sharing of results",
        "Wordle-style daily challenges",
      ],
      gameItem: {
        "@type": "Game",
        name: "Beatdle",
        description:
          "Daily music puzzle game where you listen to a beat and recreate it",
        genre: "Puzzle Game",
        playMode: "SinglePlayer",
        numberOfPlayers: "1",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a daily music puzzle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A daily music puzzle is a game where you get a new musical challenge every day. In Beatdle, you listen to a beat pattern and try to recreate it exactly using our drum sequencer. It's like Wordle but for music!",
          },
        },
        {
          "@type": "Question",
          name: "How do you play Beatdle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "1) Listen to the target beat by clicking 'Target'. 2) Switch to 'Recreate' mode and click on the grid to place drum notes. 3) Click 'Submit' to check your guess. Green borders mean correct notes, red means incorrect. You have 3 attempts to recreate the beat perfectly!",
          },
        },
        {
          "@type": "Question",
          name: "Is this music puzzle game free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! BeatKerri 303 and Beatdle are completely free to play. No downloads, no subscriptions, no ads. Just pure daily music puzzle fun!",
          },
        },
        {
          "@type": "Question",
          name: "Can I share my daily puzzle results?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely! After completing your daily Beatdle, you can share your results using the share button. It creates a spoiler-free summary showing how many attempts you took, just like Wordle!",
          },
        },
      ],
    },
  ];
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fbbf24" />

        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
      >
        {/* 🟢 Toast notifications */}
        <Toaster />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
