"use client";

import { useState, useEffect } from "react";
import {
  CustomBeat,
  addCustomBeat,
  getAllCustomBeats,
  removeCustomBeat,
  hasCustomBeat,
} from "@/utils/customBeats";

import { SequencerGrid } from "@/components/SequencerGrid";
import { GameControls } from "@/components/GameControls";
import { Calendar, Save, Trash2, Eye, Music } from "lucide-react";
import toast from "react-hot-toast";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";
import { useSoundscapes } from "@/hooks/useSoundscapes";
import * as Tone from "tone";

export default function AdminPage() {
  const { stopAllImmediately } = useSoundscapes();

  const [selectedDate, setSelectedDate] = useState("");
  const [customBeats, setCustomBeats] = useState<CustomBeat[]>([]);
  const [bpm, setBpm] = useState(90);
  const [description, setDescription] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Use the exact same pattern as Jam mode
  const {
    activeStep,
    isPlaying,
    setIsPlaying,
    playPattern: playPatternAudio,
    stopPlayback: stopPlaybackAudio,
    playStep,
    updatePattern,
  } = useAudioPlayback({ bpm, isLooping: true });

  const {
    grid,
    setGrid,
    toggleStep: toggleStepGrid,
    clearGrid,
  } = useGameState({
    onGridChange: updatePattern,
  });

  // Stop all soundscapes when component mounts and cleanup on unmount
  useEffect(() => {
    stopAllImmediately();

    // Cleanup function to stop any playing audio when component unmounts
    return () => {
      stopAllImmediately();
      stopPlaybackAudio();
      setIsPlaying(false);

      // Force stop Tone.js transport
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [stopAllImmediately, stopPlaybackAudio, setIsPlaying]);

  // Load custom beats on component mount
  useEffect(() => {
    setCustomBeats(getAllCustomBeats());
  }, []);

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  // Exact same toggle play logic as Jam mode
  const togglePlay = async () => {
    if (isPlaying) {
      stopPlaybackAudio();
      setIsPlaying(false);
    } else {
      await playPatternAudio(grid);
      setIsPlaying(true);
    }
  };

  // Exact same toggle step logic as Jam mode
  const toggleStep = async (row: number, col: number) => {
    if (isPreviewMode) return;
    toggleStepGrid(row, col);
    await playStep(row);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(Math.max(60, Math.min(200, newBpm)));
  };

  const saveBeat = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    // Ensure consistent date format (YYYY-MM-DD)
    const normalizedDate = selectedDate.split("T")[0];

    const beatNumber =
      Math.floor(
        (new Date(normalizedDate).getTime() -
          new Date("2025-07-10").getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const customBeat: CustomBeat = {
      beatNumber,
      date: normalizedDate,
      grid: JSON.parse(JSON.stringify(grid)),
      bpm,
      description: description.trim() || undefined,
    };

    addCustomBeat(customBeat);
    setCustomBeats(getAllCustomBeats());

    // Debug: Log the saved beat
    console.log("Saved beat:", customBeat);
    console.log("All beats:", getAllCustomBeats());

    toast.success(`Custom beat saved for ${normalizedDate}`);
  };

  const deleteBeat = (date: string) => {
    removeCustomBeat(date);
    setCustomBeats(getAllCustomBeats());
    toast.success(`Custom beat removed for ${date}`);
  };

  const loadBeat = (beat: CustomBeat) => {
    setSelectedDate(beat.date);
    setGrid(beat.grid);
    setBpm(beat.bpm);
    setDescription(beat.description || "");
    setIsPreviewMode(false);
    // Update the pattern in real-time if currently playing
    updatePattern(beat.grid);
    toast.success(`Loaded beat for ${formatDate(beat.date)}`);
  };

  const formatDate = (dateString: string) => {
    // Ensure we're working with a consistent date format
    const date = new Date(dateString + "T00:00:00"); // Add time to avoid timezone issues
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🎵 Beatdle Admin - Custom Beat Manager
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Beat Builder */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Music className="mr-2" />
              Beat Builder
            </h2>

            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Calendar className="mr-2" />
                  Date for Beat
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
                {selectedDate && hasCustomBeat(selectedDate) && (
                  <p className="text-yellow-400 text-sm mt-1">
                    ⚠️ Custom beat already exists for this date
                  </p>
                )}
                {/* Debug info */}
                {selectedDate && (
                  <p className="text-gray-500 text-xs mt-1">
                    Debug: Selected date: {selectedDate}, Has beat:{" "}
                    {hasCustomBeat(selectedDate) ? "Yes" : "No"}
                  </p>
                )}
              </div>

              {/* BPM */}
              <div>
                <label className="block text-sm font-medium mb-2">BPM</label>
                <input
                  type="number"
                  min="60"
                  max="200"
                  value={bpm}
                  onChange={(e) => handleBpmChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Funky groove with syncopated hi-hats"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>

              {/* Grid */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Beat Pattern
                </label>
                <div className="bg-gray-800 p-4 rounded">
                  <SequencerGrid
                    grid={grid}
                    toggleStep={toggleStep}
                    activeStep={isPlaying ? activeStep : null}
                  />
                </div>
                <div className="mt-2">
                  <GameControls
                    isPlaying={isPlaying}
                    isLooping={true}
                    onTogglePlay={togglePlay}
                    onToggleLoop={() => {}} // Loop is always on for admin
                    onClearGrid={clearGrid}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={saveBeat}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center"
                >
                  <Save className="mr-2" />
                  Save Beat
                </button>
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-4 py-2 rounded flex items-center ${
                    isPreviewMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  } text-white`}
                >
                  <Eye className="mr-2" />
                  {isPreviewMode ? "Edit" : "Preview"}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Beats List */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Saved Custom Beats</h2>

            {customBeats.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No custom beats saved yet
              </p>
            ) : (
              <div className="space-y-3">
                {customBeats
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((beat) => (
                    <div
                      key={beat.date}
                      className="bg-gray-800 p-4 rounded flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {formatDate(beat.date)}
                          </span>
                          <span className="text-sm text-gray-400">
                            Beat #{beat.beatNumber}
                          </span>
                          <span className="text-sm text-blue-400">
                            {beat.bpm} BPM
                          </span>
                        </div>
                        {beat.description && (
                          <p className="text-sm text-gray-300 mt-1">
                            {beat.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadBeat(beat)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteBeat(beat.date)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-3">How to Use</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Select a date for your custom beat</li>
            <li>• Set the BPM (beats per minute)</li>
            <li>• Click on the grid to create your beat pattern</li>
            <li>• Use Play/Stop to preview your beat</li>
            <li>• Add an optional description</li>
            <li>
              • Save the beat - it will override the generated beat for that
              date
            </li>
            <li>
              • If no custom beat exists for a date, the generated beat will be
              used
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
