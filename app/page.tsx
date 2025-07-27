// app/page.tsx
"use client";

import Link from "next/link";
import { playNavigationClick } from "@/utils/clickSounds";

export default function Home() {
  const handleNavigationClick = () => {
    playNavigationClick();
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl md:text-8xl font-mono font-extrabold mb-8 text-center text-amber-400 drop-shadow-[0_0_20px_#fbbf24] tracking-widest">
        BEATKERRI
      </h1>

      <div className="space-y-6 w-full max-w-md text-center">
        <Link
          href="/beatdle"
          onClick={handleNavigationClick}
          className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 px-8 rounded-xl font-mono text-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 border border-purple-400 h-24 flex items-center justify-center"
        >
          Beatdle - Daily Beat Challenge
        </Link>

        <Link
          href="/challenge"
          onClick={handleNavigationClick}
          className="block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-6 px-8 rounded-xl font-mono text-xl shadow-lg hover:shadow-green-500/25 transition-all duration-200 border border-green-400 h-24 flex items-center justify-center"
        >
          Challenge Mode - Level Up Your Beats
        </Link>

        <Link
          href="/jam"
          onClick={handleNavigationClick}
          className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-6 px-8 rounded-xl font-mono text-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border border-blue-400 h-24 flex items-center justify-center"
        >
          Jam Mode - Create Your Own Beats
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="mt-8 flex justify-center gap-6 text-sm">
        <Link
          href="/about"
          onClick={handleNavigationClick}
          className="text-gray-400 hover:text-amber-400 transition-colors font-mono"
        >
          About
        </Link>
        <Link
          href="/how-to-play"
          onClick={handleNavigationClick}
          className="text-gray-400 hover:text-amber-400 transition-colors font-mono"
        >
          How to Play
        </Link>
      </div>

      <footer className="mt-12 text-gray-500 text-xs font-mono">
        © {new Date().getFullYear()} Junkerri
      </footer>
    </main>
  );
}
