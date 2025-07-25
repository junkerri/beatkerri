// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl md:text-8xl font-mono font-extrabold mb-8 text-center text-amber-400 drop-shadow-[0_0_20px_#fbbf24] tracking-widest">
        BEATKERRI
      </h1>

      <div className="space-y-6 w-full max-w-md text-center">
        <Link
          href="/beatdle"
          className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 px-8 rounded-xl font-mono text-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 border border-purple-400"
        >
          Beatdle - Daily Beat Challenge
        </Link>

        <Link
          href="/challenge"
          className="block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-6 px-8 rounded-xl font-mono text-xl shadow-lg hover:shadow-green-500/25 transition-all duration-200 border border-green-400"
        >
          Challenge Mode
        </Link>

        <Link
          href="/jam"
          className="block bg-gradient-to-r from-gray-700 to-gray-600 text-white py-6 px-8 rounded-xl font-mono text-xl shadow-lg opacity-50 cursor-not-allowed border border-gray-500"
        >
          Jam Mode
        </Link>
      </div>

      <footer className="mt-12 text-gray-500 text-xs font-mono">
        © {new Date().getFullYear()} Junkerri
      </footer>
    </main>
  );
}
