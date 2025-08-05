// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { playNavigationClick } from "@/utils/clickSounds";
import { useSoundscapes } from "@/hooks/useSoundscapes";
import { AudioControls } from "@/components/AudioControls";

// Animated Title Component
const AnimatedTitle: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState(0);

  const letters = "BEATKERRI";
  const sequencerNote = "■"; // Unicode filled square for sequencer note

  useEffect(() => {
    // Phase 0: Show sequencer notes
    const timer1 = setTimeout(() => {
      setAnimationPhase(1);
    }, 300);

    // Phase 1: Start revealing letters one by one
    const timer2 = setTimeout(() => {
      setAnimationPhase(2);
      // Start revealing letters with delays
      letters.split("").forEach((_, index) => {
        setTimeout(() => {
          setRevealedLetters(index + 1);
        }, 1200 + index * 80); // 80ms delay between each letter (faster)
      });
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const getLetterStyle = (index: number) => {
    const baseStyle =
      "inline-block transition-all duration-500 ease-out w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center border-2 text-xl sm:text-5xl md:text-6xl";

    if (animationPhase === 0) {
      // Initial state - invisible
      return `${baseStyle} border-transparent opacity-0`;
    } else if (animationPhase === 1) {
      // Show sequencer notes
      return `${baseStyle} border-transparent opacity-100 text-amber-400 drop-shadow-[0_0_30px_#fbbf24] animate-pulse`;
    } else {
      // Letter reveal phase
      const isRevealed = index < revealedLetters;
      const isCurrentlyRevealing = index === revealedLetters - 1;

      if (isRevealed && !isCurrentlyRevealing) {
        // Fully revealed letter - add green outline and blinking if all letters are revealed
        const allRevealed = revealedLetters >= letters.length;
        return `${baseStyle} border-green-500 opacity-100 text-amber-400 drop-shadow-[0_0_20px_#fbbf24] ${
          allRevealed ? "animate-border-pulse" : ""
        }`;
      } else if (isCurrentlyRevealing) {
        // Currently revealing letter - green square outline
        const allRevealed = revealedLetters >= letters.length;
        return `${baseStyle} border-green-500 opacity-100 text-amber-400 drop-shadow-[0_0_30px_#fbbf24] ${
          allRevealed ? "animate-border-pulse" : "animate-pulse"
        }`;
      } else {
        // Still a sequencer note
        return `${baseStyle} border-transparent opacity-100 text-amber-400 drop-shadow-[0_0_30px_#fbbf24] animate-pulse`;
      }
    }
  };

  const getDisplayText = () => {
    if (animationPhase <= 1) {
      return sequencerNote.repeat(letters.length);
    } else {
      // Mix of revealed letters and sequencer notes
      return letters
        .split("")
        .map((letter, index) => {
          return index < revealedLetters ? letter : sequencerNote;
        })
        .join("");
    }
  };

  return (
    <h1 className="text-4xl md:text-6xl font-orbitron font-extrabold mb-8 text-center tracking-widest flex justify-center items-center gap-0.5 sm:gap-1">
      {getDisplayText()
        .split("")
        .map((char, index) => (
          <span
            key={index}
            className={getLetterStyle(index)}
            style={{
              animationDelay: `${index * 50}ms`,
              transitionDelay: `${index * 100}ms`,
            }}
          >
            {char}
          </span>
        ))}
    </h1>
  );
};

export default function Home() {
  const { playMainPage, stopAllImmediately } = useSoundscapes();

  const handleNavigationClick = () => {
    playNavigationClick();
  };

  const handlePageTouch = () => {
    // Ensure audio context is initialized on first touch (mobile requirement)
    if (typeof window !== "undefined" && window.AudioContext) {
      const audioContext = new AudioContext();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
    }
  };

  // Start ambient music when component mounts
  React.useEffect(() => {
    // Stop any existing soundscapes immediately to prevent audio chaos
    stopAllImmediately();
    // Start main page ambient
    playMainPage();

    // Stop ambient music when navigating away
    return () => {
      stopAllImmediately();
    };
  }, [playMainPage, stopAllImmediately]);

  return (
    <main
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6"
      onTouchStart={handlePageTouch}
    >
      <div className="absolute top-4 right-4">
        <AudioControls />
      </div>

      <AnimatedTitle />

      <p className="text-center text-gray-400 font-mono text-sm mb-8 tracking-wide">
        16-Step Digital Sequencer
      </p>

      <div className="space-y-6 w-full max-w-md text-center">
        <Link
          href="/beatdle"
          onClick={handleNavigationClick}
          className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 px-8 rounded-xl font-orbitron text-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 border border-purple-400 h-24 flex items-center justify-center tracking-wider"
        >
          Beatdle - Daily Beat Challenge
        </Link>

        <Link
          href="/challenge"
          onClick={handleNavigationClick}
          className="block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-6 px-8 rounded-xl font-orbitron text-xl shadow-lg hover:shadow-green-500/25 transition-all duration-200 border border-green-400 h-24 flex items-center justify-center tracking-wider"
        >
          Challenge Mode - Level Up Your Beats
        </Link>

        <Link
          href="/jam"
          onClick={handleNavigationClick}
          className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-6 px-8 rounded-xl font-orbitron text-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border border-blue-400 h-24 flex items-center justify-center tracking-wider"
        >
          Jam Mode - Create Your Own Beats
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="mt-8 flex justify-center gap-8 text-lg">
        <Link
          href="/about"
          onClick={handleNavigationClick}
          className="text-amber-400 hover:text-amber-300 transition-colors font-orbitron font-semibold tracking-wide drop-shadow-[0_0_10px_#fbbf24] hover:drop-shadow-[0_0_15px_#fbbf24]"
        >
          About
        </Link>
        <Link
          href="/how-to-play"
          onClick={handleNavigationClick}
          className="text-amber-400 hover:text-amber-300 transition-colors font-orbitron font-semibold tracking-wide drop-shadow-[0_0_10px_#fbbf24] hover:drop-shadow-[0_0_15px_#fbbf24]"
        >
          How to Play
        </Link>
      </div>

      <footer className="mt-12 text-gray-500 text-xs font-mono">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://github.com/junkerri"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-amber-400 transition-colors underline"
        >
          Junkerri
        </a>
      </footer>
    </main>
  );
}
