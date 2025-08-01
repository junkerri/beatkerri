import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "BeatKerri 303 - Free Online Music Puzzle Game & Beat Making Tool",
  description:
    "Play BeatKerri 303 - the ultimate free online music puzzle game! Daily beat challenges, rhythm training, and creative beat making. Perfect for music lovers, puzzle gamers, and aspiring producers. No download required.",
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
    title: "BeatKerri 303 - Free Online Music Puzzle Game & Beat Making Tool",
    description:
      "Play BeatKerri 303 - the ultimate free online music puzzle game! Daily beat challenges, rhythm training, and creative beat making. Perfect for music lovers, puzzle gamers, and aspiring producers.",
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
    title: "BeatKerri 303 - Free Online Music Puzzle Game & Beat Making Tool",
    description:
      "Play BeatKerri 303 - the ultimate free online music puzzle game! Daily beat challenges, rhythm training, and creative beat making. Perfect for music lovers, puzzle gamers, and aspiring producers.",
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
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BeatKerri 303",
    description:
      "Free online music puzzle game with daily beat challenges, rhythm training, and creative beat making",
    url: "https://beatkerri.com",
    applicationCategory: "MusicApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Aastha Karki",
      url: "https://junkerri.com",
    },
    creator: {
      "@type": "Person",
      name: "Aastha Karki (junkerri)",
    },
    genre: ["Music Game", "Puzzle Game", "Rhythm Game"],
    keywords:
      "music puzzle game, online music game, free music game, beat making game, rhythm puzzle game, daily music challenge, Beatdle",
    screenshot: "https://beatkerri.com/og-image.png",
    softwareVersion: "1.0.0",
    featureList: [
      "Daily beat challenges",
      "Rhythm training",
      "Creative beat making",
      "Progressive difficulty levels",
      "Real-time audio synthesis",
      "No download required",
      "Free to play",
    ],
  };
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 🟢 Toast notifications */}
        <Toaster />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
