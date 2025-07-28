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
  title: "BeatKerri 303 - Interactive Drum Machine Game by Junkerri",
  description:
    "BeatKerri 303 is an interactive web-based drum machine game created by Aastha Karki (junkerri), the Nepali artist behind Junkerri Art. Features three modes: Beatdle (daily challenges), Challenge (progressive difficulty), and Jam (creative mode).",
  keywords: [
    "drum machine",
    "beat making",
    "music game",
    "rhythm game",
    "TB-303",
    "interactive music",
    "beat matching",
    "daily challenge",
    "music creation",
    "web audio",
    "Tone.js",
    "React music app",
    "drum sequencer",
    "beat kerri",
    "junkerri",
    "junkerri art",
    "Aastha Karki",
    "Nepali artist",
    "music education",
    "rhythm training",
    "audio synthesis",
    "music technology",
    "creative music",
    "abstract art",
    "playful creations",
  ],
  authors: [{ name: "Aastha Karki", url: "https://junkerri.com" }],
  creator: "Aastha Karki (junkerri)",
  publisher: "Junkerri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://beatkerri.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BeatKerri 303 - Interactive Drum Machine Game by Junkerri",
    description:
      "Create, challenge, and jam with BeatKerri 303 - the interactive drum machine game by Aastha Karki (junkerri), creator of Junkerri Art. Features daily beat challenges, progressive difficulty levels, and creative mode.",
    url: "https://beatkerri.vercel.app",
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
    title: "BeatKerri 303 - Interactive Drum Machine Game by Junkerri",
    description:
      "Create, challenge, and jam with BeatKerri 303 - the interactive drum machine game by Aastha Karki (junkerri), creator of Junkerri Art. Features daily beat challenges, progressive difficulty levels, and creative mode.",
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
    "theme-color": "#fbbf24",
    "color-scheme": "dark",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "BeatKerri 303",
    "application-name": "BeatKerri 303 by Junkerri",
    "msapplication-TileColor": "#fbbf24",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "BeatKerri 303",
              description:
                "Interactive drum machine game with daily challenges and creative modes",
              url: "https://beatkerri.vercel.app",
              applicationCategory: "MusicApplication",
              operatingSystem: "Web Browser",
              author: {
                "@type": "Person",
                name: "Aastha Karki",
                alternateName: "junkerri",
                url: "https://junkerri.com",
                jobTitle: "Artist & Developer",
                description:
                  "Nepali artist creating playful abstract art and interactive music applications",
              },
              creator: {
                "@type": "Person",
                name: "Aastha Karki",
                alternateName: "junkerri",
                url: "https://junkerri.com",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Daily beat challenges",
                "Progressive difficulty levels",
                "Creative jam mode",
                "WAV export functionality",
                "Real-time audio synthesis",
              ],
              screenshot: "https://beatkerri.vercel.app/og-image.png",
              softwareVersion: "1.0.0",
            }),
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
