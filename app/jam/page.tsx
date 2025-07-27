"use client";

import { useState, useEffect } from "react";
import { SequencerGrid } from "@/components/SequencerGrid";
import { GameControls } from "@/components/GameControls";
import { GameStats } from "@/components/GameStats";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";
import { Download, Upload, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function JamMode() {
  const [bpm, setBpm] = useState(120);
  const [isLooping, setIsLooping] = useState(true);
  const [savedBeats, setSavedBeats] = useState<
    Array<{
      id: string;
      name: string;
      grid: boolean[][];
      bpm: number;
      timestamp: number;
    }>
  >([]);

  // Use shared hooks
  const {
    activeStep,
    isPlaying,
    setIsPlaying,
    playPattern: playPatternAudio,
    stopPlayback: stopPlaybackAudio,
    playStep,
  } = useAudioPlayback({ bpm, isLooping });

  const {
    grid,
    setGrid,
    toggleStep: toggleStepGrid,
    clearGrid,
  } = useGameState();

  const togglePlay = async () => {
    if (isPlaying) {
      stopPlaybackAudio();
      setIsPlaying(false);
    } else {
      await playPatternAudio(grid);
      setIsPlaying(true);
    }
  };

  const toggleStep = async (row: number, col: number) => {
    toggleStepGrid(row, col);
    await playStep(row);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(Math.max(60, Math.min(200, newBpm)));
  };

  const saveBeat = () => {
    const name = prompt("Enter a name for your beat:");
    if (!name) return;

    const newBeat = {
      id: Date.now().toString(),
      name,
      grid: JSON.parse(JSON.stringify(grid)),
      bpm,
      timestamp: Date.now(),
    };

    const updatedBeats = [...savedBeats, newBeat];
    setSavedBeats(updatedBeats);
    localStorage.setItem("jam_saved_beats", JSON.stringify(updatedBeats));
    toast.success(`Beat "${name}" saved!`);
  };

  const loadBeat = (beat: (typeof savedBeats)[0]) => {
    setGrid(beat.grid);
    setBpm(beat.bpm);
    toast.success(`Loaded "${beat.name}"`);
  };

  const deleteBeat = (beatId: string) => {
    const updatedBeats = savedBeats.filter((beat) => beat.id !== beatId);
    setSavedBeats(updatedBeats);
    localStorage.setItem("jam_saved_beats", JSON.stringify(updatedBeats));
    toast.success("Beat deleted!");
  };

  const exportBeat = () => {
    const beatData = {
      grid,
      bpm,
      timestamp: Date.now(),
    };

    const dataStr = JSON.stringify(beatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `beat-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Beat exported!");
  };

  const importBeat = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const beatData = JSON.parse(e.target?.result as string);
          setGrid(beatData.grid);
          setBpm(beatData.bpm || 120);
          toast.success("Beat imported!");
        } catch {
          toast.error("Invalid beat file!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Load saved beats on mount
  useEffect(() => {
    const saved = localStorage.getItem("jam_saved_beats");
    if (saved) {
      try {
        setSavedBeats(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load saved beats:", error);
      }
    }
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        🎛️ Jam Mode: Create your own groove!
      </p>

      <div
        className="
          relative
          bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
          border-4 border-gray-700
          rounded-2xl
          shadow-2xl
          w-full max-w-2xl
          p-6
          flex flex-col items-center
          drum-machine-outline
        "
        style={{
          boxShadow: "0 0 0 4px #222 inset, 0 8px 32px 0 rgba(0,0,0,0.8)",
          borderRadius: "1.5rem",
          border: "4px solid #444",
          position: "relative",
        }}
      >
        <h1 className="text-2xl font-extrabold mb-4 font-mono text-center tracking-widest text-amber-400 drop-shadow">
          BEATKERRI 303
        </h1>
        <p className="text-gray-400 font-mono text-center mb-2">Jam Mode</p>

        {/* Stats with Interactive BPM */}
        <div className="flex justify-end mb-4 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBpmChange(bpm - 1)}
              className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-sm font-mono transition-colors"
              disabled={bpm <= 60}
            >
              -
            </button>
            <GameStats bpm={bpm} />
            <button
              onClick={() => handleBpmChange(bpm + 1)}
              className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-sm font-mono transition-colors"
              disabled={bpm >= 200}
            >
              +
            </button>
          </div>
        </div>

        {/* Sequencer */}
        <div className="w-full mb-4">
          <SequencerGrid
            grid={grid}
            toggleStep={toggleStep}
            activeStep={activeStep}
          />
        </div>

        {/* Controls */}
        <GameControls
          isPlaying={isPlaying}
          isLooping={isLooping}
          onTogglePlay={togglePlay}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onClearGrid={clearGrid}
        />

        <footer className="mt-6 text-gray-500 text-xs font-mono w-full text-center">
          © {new Date().getFullYear()} Junkerri
        </footer>

        {/* Drum machine lights/knobs for realism */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-700 border-2 border-gray-800 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-gray-800 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-gray-800 shadow-inner"></div>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-900"></div>
          <div className="w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-900"></div>
        </div>
      </div>

      {/* Save/Load Controls */}
      <div className="mt-4 w-full max-w-2xl space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white font-mono text-sm mb-3">Save & Load</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveBeat}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded flex items-center gap-2 text-sm transition-colors"
            >
              <Save size={16} />
              Save Beat
            </button>
            <button
              onClick={exportBeat}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 text-sm transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={importBeat}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-2 text-sm transition-colors"
            >
              <Upload size={16} />
              Import
            </button>
          </div>
        </div>

        {/* Saved Beats */}
        {savedBeats.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-mono text-sm mb-3">Saved Beats</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedBeats.map((beat) => (
                <div
                  key={beat.id}
                  className="flex items-center justify-between bg-gray-700 p-2 rounded"
                >
                  <div className="flex-1">
                    <div className="text-white font-mono text-sm">
                      {beat.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      BPM: {beat.bpm} •{" "}
                      {new Date(beat.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadBeat(beat)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteBeat(beat.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
