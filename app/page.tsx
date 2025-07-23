// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-mono mb-6 text-center">BEATKERRI</h1>

      <div className="space-y-4 w-full max-w-sm text-center">
        <Link
          href="/challenge"
          className="block bg-green-600 hover:bg-green-500 text-white py-4 px-6 rounded-lg font-mono shadow transition"
        >
          🎮 Challenge Mode
        </Link>

        <Link
          href="/beatdle"
          className="block bg-purple-600 hover:bg-purple-500 text-white py-4 px-6 rounded-lg font-mono shadow transition"
        >
          🧩 Daily Beat Challenge – Beatdle
        </Link>

        <Link
          href="/jam"
          className="block bg-gray-700 text-white py-4 px-6 rounded-lg font-mono shadow transition opacity-50 cursor-not-allowed"
        >
          🥁 Jam Mode (Coming Soon)
        </Link>
      </div>

      <footer className="mt-8 text-gray-500 text-xs font-mono">
        © {new Date().getFullYear()} Junkerri
      </footer>
    </main>
  );
}
