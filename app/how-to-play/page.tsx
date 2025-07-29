"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Repeat,
  Trash2,
  Zap,
  Share2,
  Download,
  Upload,
  Save,
  Music,
  Puzzle,
  Trophy,
  Settings,
  Crosshair,
  Wand2,
} from "lucide-react";
import { playNavigationClick } from "@/utils/clickSounds";
import { useSoundscapes } from "@/hooks/useSoundscapes";

export default function HowToPlay() {
  const { playMainPage } = useSoundscapes();

  const handleNavigationClick = () => {
    playNavigationClick();
  };

  // Start ambient music when component mounts (only if not already playing)
  React.useEffect(() => {
    // Start main page ambient (will only start if not already playing)
    playMainPage();

    // Don't stop music when navigating away - let it continue
  }, [playMainPage]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            onClick={handleNavigationClick}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-extrabold text-center text-amber-400 drop-shadow-[0_0_20px_#fbbf24] tracking-widest mb-4">
            HOW TO PLAY
          </h1>
          <p className="text-center text-gray-400 font-mono text-lg">
            Master the Beatkerri 303 Drum Machine
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Basic Controls */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-6">
              Basic Controls
            </h2>
            <div className="space-y-6">
              {/* Control Buttons */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Control Buttons
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Play/Stop</div>
                      <div className="text-gray-400 text-sm">
                        Start or stop playback
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Repeat className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Loop</div>
                      <div className="text-gray-400 text-sm">
                        Toggle continuous playback
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Clear</div>
                      <div className="text-gray-400 text-sm">
                        Reset the grid
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Submit</div>
                      <div className="text-gray-400 text-sm">
                        Check your guess (Beatdle/Challenge)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Sequencer, Mode Toggle, and Instruments */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Step Sequencer
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded border-2 border-amber-500"></div>
                      <span className="text-gray-300">
                        Active step (note is playing)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-700 rounded border-2 border-gray-600"></div>
                      <span className="text-gray-300">
                        Inactive step (no note)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded border-2 border-green-400"></div>
                      <span className="text-gray-300">
                        Correct guess (green border)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded border-2 border-red-400"></div>
                      <span className="text-gray-300">
                        Incorrect guess (red border)
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Beat Toggle
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Crosshair className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          Target Beat
                        </div>
                        <div className="text-gray-400 text-xs">
                          Listen to target beat (grid is read-only)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Wand2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          Recreate
                        </div>
                        <div className="text-gray-400 text-xs">
                          Place notes to recreate
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-800 rounded-lg border-l-4 border-amber-400">
                    <p className="text-xs text-gray-300">
                      <strong>Note:</strong> In Target mode, the sequencer grid
                      is read-only. You can see the play head moving through the
                      pattern, but you cannot edit the grid. Switch to Recreate
                      mode to place your own notes and attempt to match the
                      target beat.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Instruments
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">BD</span>
                      <span className="text-gray-300">Bass Drum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">SN</span>
                      <span className="text-gray-300">Snare Drum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">HH</span>
                      <span className="text-gray-300">Closed Hi-Hat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">OH</span>
                      <span className="text-gray-300">Open Hi-Hat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">LT</span>
                      <span className="text-gray-300">Low Tom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">HT</span>
                      <span className="text-gray-300">High Tom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">CL</span>
                      <span className="text-gray-300">Clap</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Beatdle Mode Instructions */}
          <section
            id="beatdle-mode"
            className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-600"
          >
            <h2 className="text-2xl font-bold font-mono text-purple-300 mb-6">
              <Puzzle className="inline w-6 h-6 mr-2" />
              Beatdle Mode
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Objective</h3>
                <p className="text-sm">
                  Listen to a daily target beat and recreate it exactly within 3
                  attempts. Each day features a new beat with different BPM and
                  pattern complexity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  How to Play
                </h3>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>
                    Click the <Crosshair className="inline w-4 h-4" /> Target
                    button to hear the target beat
                  </li>
                  <li>
                    Switch to &quot;Recreate&quot; mode using the toggle and
                    click on the grid to place notes
                  </li>
                  <li>
                    Click <Zap className="inline w-4 h-4" /> Submit to check
                    your guess
                  </li>
                  <li>
                    Green borders = correct notes, Red borders = incorrect notes
                  </li>
                  <li>You have 3 attempts to recreate the beat perfectly</li>
                  <li>
                    Share your results with{" "}
                    <Share2 className="inline w-4 h-4" /> Share button
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Scoring</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>5 points per correct note on first attempt</li>
                  <li>3 points per correct note on second attempt</li>
                  <li>1 point per correct note on third attempt</li>
                  <li>+10 bonus points for perfect recreation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Challenge Mode Instructions */}
          <section
            id="challenge-mode"
            className="bg-gradient-to-br from-green-900 to-emerald-900 p-6 rounded-lg border border-green-600"
          >
            <h2 className="text-2xl font-bold font-mono text-green-300 mb-6">
              <Trophy className="inline w-6 h-6 mr-2" />
              Challenge Mode
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Objective</h3>
                <p className="text-sm">
                  Progress through increasingly difficult levels, unlocking new
                  instruments and advanced stacking rules as you improve your
                  beat-making skills.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  How to Play
                </h3>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>
                    Click the <Crosshair className="inline w-4 h-4" /> Target
                    button to hear the target beat
                  </li>
                  <li>
                    Switch to &quot;Recreate&quot; mode using the toggle and
                    click on the grid to place notes
                  </li>
                  <li>
                    Click <Zap className="inline w-4 h-4" /> Submit to check
                    your guess
                  </li>
                  <li>
                    Green borders = correct notes, Red borders = incorrect notes
                  </li>
                  <li>You have 3 attempts to recreate the beat perfectly</li>
                  <li>Progress to the next level when you succeed</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Progression
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    <strong>Levels 1-5:</strong> Basic instruments (BD, SN, HH)
                    - No stacking
                  </li>
                  <li>
                    <strong>Levels 6-10:</strong> Add Clap - No stacking
                  </li>
                  <li>
                    <strong>Levels 11-15:</strong> Add Low Tom - No stacking
                  </li>
                  <li>
                    <strong>Levels 16-20:</strong> Add High Tom - Basic stacking
                    allowed
                  </li>
                  <li>
                    <strong>Levels 21+:</strong> Add Open Hi-Hat - Advanced
                    stacking rules
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Stacking Rules
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    <strong>Basic:</strong> BD + HH, BD + SN, BD + CL
                  </li>
                  <li>
                    <strong>Advanced:</strong> BD + OH, multiple combinations
                  </li>
                  <li>Follow the rules to create valid beats</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Jam Mode Instructions */}
          <section
            id="jam-mode"
            className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-lg border border-blue-600"
          >
            <h2 className="text-2xl font-bold font-mono text-blue-300 mb-6">
              <Settings className="inline w-6 h-6 mr-2" />
              Jam Mode
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Objective</h3>
                <p className="text-sm">
                  Create your own beats with unlimited creativity. No rules, no
                  constraints - just pure musical expression and
                  experimentation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Controls</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-bold text-white mb-2">Playback</h4>
                    <ul className="space-y-1">
                      <li>
                        <Play className="inline w-4 h-4" /> Play/Stop your beat
                      </li>
                      <li>
                        <Repeat className="inline w-4 h-4" /> Toggle looping
                      </li>
                      <li>
                        <Trash2 className="inline w-4 h-4" /> Clear the grid
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">BPM Control</h4>
                    <ul className="space-y-1">
                      <li>Use +/- buttons to adjust tempo</li>
                      <li>Range: 60-200 BPM</li>
                      <li>Real-time tempo changes</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Save & Export
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>
                    <Save className="inline w-4 h-4" /> Save Beat: Store locally
                    with custom name
                  </li>
                  <li>
                    <Download className="inline w-4 h-4" /> Export JSON: Share
                    beat data
                  </li>
                  <li>
                    <Music className="inline w-4 h-4" /> Export WAV: Download as
                    audio file
                  </li>
                  <li>
                    <Upload className="inline w-4 h-4" /> Import: Load saved
                    beats
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips & Tricks */}
          <section className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-mono text-amber-400 mb-6">
              Tips & Tricks
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">
                  For Beginners
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Start with simple patterns using just BD and SN</li>
                  <li>• Use the loop function to hear your beat repeatedly</li>
                  <li>• Pay attention to the visual feedback for learning</li>
                  <li>• Practice with different BPMs to develop timing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-3">
                  For Advanced Users
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Experiment with off-beat patterns</li>
                  <li>• Use stacking to create complex rhythms</li>
                  <li>• Export WAV files for use in your DAW</li>
                  <li>• Challenge yourself with higher BPMs</li>
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
              href="/about"
              onClick={handleNavigationClick}
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              About Beatkerri →
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
