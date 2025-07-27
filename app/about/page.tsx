"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Music,
  Target,
  Zap,
  Download,
  User,
  Puzzle,
  Trophy,
  Settings,
} from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-extrabold text-center text-amber-400 drop-shadow-[0_0_20px_#fbbf24] tracking-widest mb-4">
            BEATKERRI 303
          </h1>
          <p className="text-center text-gray-400 font-mono text-lg">
            The Ultimate Beat-Matching Drum Machine
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Creator Story */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-4">
              <User className="inline w-6 h-6 mr-2" />
              About the Creator
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Beatkerri 303 was developed by{" "}
              <strong className="text-amber-400">Aastha Kumari Karki</strong>
              (aka <strong className="text-amber-400">junkerri</strong>), a
              musician who wanted to design and build an interactive game based
              on drum machines to play with friends.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              As a musician, I&apos;m inspired by how music, especially singing
              and drumming, brings people together. It&apos;s more than art;
              it&apos;s a way we connect and belong.
            </p>
            <p className="text-gray-300 leading-relaxed">
              I created this beat-matching game to reflect that spirit. Rhythm
              is universal. You don&apos;t need to be musical to feel it.
              It&apos;s already in you.
            </p>
          </section>

          {/* What is Beatkerri */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-4">
              What is Beatkerri 303?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Beatkerri 303 is an interactive web-based drum machine that
              combines the classic TR-303 aesthetic with modern web
              technologies. It features three distinct game modes that challenge
              your rhythm skills, creativity, and musical intuition.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Built with React, TypeScript, and Tone.js, Beatkerri 303 delivers
              high-quality audio synthesis and a responsive, professional
              interface that works seamlessly across all devices.
            </p>
          </section>

          {/* Game Modes */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-6">
              Game Modes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Beatdle Mode */}
              <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-4 rounded-lg border border-purple-600">
                <h3 className="text-xl font-bold font-mono text-purple-300 mb-2">
                  <Puzzle className="inline w-5 h-5 mr-2" />
                  Beatdle Mode
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Daily beat challenges inspired by Wordle. Listen to a target
                  beat and recreate it within 3 attempts. Share your results
                  with friends!
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• New beat every day</li>
                  <li>• Wordle-style sharing</li>
                  <li>• Progress tracking</li>
                  <li>• Score system</li>
                </ul>
              </div>

              {/* Challenge Mode */}
              <div className="bg-gradient-to-br from-green-900 to-emerald-900 p-4 rounded-lg border border-green-600">
                <h3 className="text-xl font-bold font-mono text-green-300 mb-2">
                  <Trophy className="inline w-5 h-5 mr-2" />
                  Challenge Mode
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Progressive difficulty levels that unlock new instruments and
                  stacking rules. Level up your beat-making skills!
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Progressive difficulty</li>
                  <li>• Unlock new instruments</li>
                  <li>• Advanced stacking rules</li>
                  <li>• Score tracking</li>
                </ul>
              </div>

              {/* Jam Mode */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-4 rounded-lg border border-blue-600">
                <h3 className="text-xl font-bold font-mono text-blue-300 mb-2">
                  <Settings className="inline w-5 h-5 mr-2" />
                  Jam Mode
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Free-form creative mode for making your own beats. Save, load,
                  and export your creations as WAV files!
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Unlimited creativity</li>
                  <li>• Save & load beats</li>
                  <li>• WAV export</li>
                  <li>• BPM control</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-6">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Music className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white mb-1">
                      High-Quality Audio
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Professional drum samples with real-time audio synthesis
                      powered by Tone.js
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white mb-1">
                      Multiple Instruments
                    </h4>
                    <p className="text-gray-400 text-sm">
                      7 classic drum machine sounds: Kick, Snare, Hi-Hats, Toms,
                      and Clap
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white mb-1">
                      Real-Time Feedback
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Visual step sequencer with active step highlighting and
                      instant audio playback
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white mb-1">
                      Export & Share
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Export beats as WAV files and share results with friends
                      via social media
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-4">
              Technical Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-bold text-white mb-2">Built With</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• Next.js 15 - React Framework</li>
                  <li>• TypeScript - Type Safety</li>
                  <li>• Tone.js - Audio Synthesis</li>
                  <li>• Tailwind CSS - Styling</li>
                  <li>• Lucide React - Icons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Audio Features</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• 44.1kHz Sample Rate</li>
                  <li>• 16-bit PCM WAV Export</li>
                  <li>• Real-time Audio Processing</li>
                  <li>• Cross-browser Compatibility</li>
                  <li>• Mobile Audio Support</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm font-mono">
          <p>© {new Date().getFullYear()} Junkerri - Beatkerri 303</p>
          <p className="mt-2">
            <Link
              href="/how-to-play"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              How to Play →
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
