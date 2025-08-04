"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SequencerGrid } from "@/components/SequencerGrid";
import { GameControls } from "@/components/GameControls";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";
import {
  Download,
  Upload,
  Save,
  Music,
  HelpCircle,
  Piano,
} from "lucide-react";
import Link from "next/link";
import { playSubmitClick } from "@/utils/clickSounds";
import toast from "react-hot-toast";
import { useSoundscapes } from "@/hooks/useSoundscapes";
import * as Tone from "tone";

export default function JamModeComponent() {
  const { stopAllImmediately } = useSoundscapes();

  const [bpm, setBpm] = useState(120);
  const [bpmInput, setBpmInput] = useState("120");

  // Share menu state for sequencer controls
  const [jamShareMenuOpen, setJamShareMenuOpen] = useState(false);
  const jamShareMenuRef = useRef<HTMLDivElement>(null);
  const [isLooping, setIsLooping] = useState(true);

  // Close jam share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        jamShareMenuRef.current &&
        !jamShareMenuRef.current.contains(event.target as Node)
      ) {
        setJamShareMenuOpen(false);
      }
    };

    if (jamShareMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [jamShareMenuOpen]);
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
    updatePattern, // Add the new updatePattern function
  } = useAudioPlayback({ bpm, isLooping });

  const {
    grid,
    setGrid: setGridRaw,
    toggleStep: toggleStepGrid,
    clearGrid,
  } = useGameState({
    onGridChange: updatePattern, // Connect the real-time update callback
  });

  // Safe grid setter that always keeps audio in sync
  const setGrid = useCallback(
    (newGrid: boolean[][]) => {
      setGridRaw(newGrid);
      updatePattern(newGrid); // Ensure audio always syncs
    },
    [setGridRaw, updatePattern]
  );

  // Share handlers for sequencer controls
  const handleToggleJamShareMenu = useCallback(() => {
    setJamShareMenuOpen(!jamShareMenuOpen);
  }, [jamShareMenuOpen]);

  const handleJamCopyShareLink = useCallback(async () => {
    const shareUrl = encodeBeatToUrl(grid, bpm);
    const shareText = `🎵 Check out this beat I made on BeatKerri! 🥁`;
    const fullText = `${shareText}\n\nPlay it here: ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast.success("Beat link copied to clipboard!");
      setJamShareMenuOpen(false);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, [grid, bpm]);

  const handleJamShareToX = useCallback(async () => {
    const shareUrl = encodeBeatToUrl(grid, bpm);
    const tweetText = `🎵 Check out this beat I made on BeatKerri! 🥁`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(shareUrl)}`;

    window.open(xUrl, "_blank");
    toast.success("Sharing to X!");
    setJamShareMenuOpen(false);
  }, [grid, bpm]);

  const handleJamShareToFacebook = useCallback(async () => {
    const shareUrl = encodeBeatToUrl(grid, bpm);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;

    window.open(facebookUrl, "_blank");
    toast.success("Sharing to Facebook!");
    setJamShareMenuOpen(false);
  }, [grid, bpm]);

  const handleJamShareToWhatsApp = useCallback(async () => {
    const shareUrl = encodeBeatToUrl(grid, bpm);
    const whatsappText = `🎵 Check out this beat I made on BeatKerri! 🥁\n\nPlay it here: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      whatsappText
    )}`;

    window.open(whatsappUrl, "_blank");
    toast.success("Sharing to WhatsApp!");
    setJamShareMenuOpen(false);
  }, [grid, bpm]);

  const handleJamShareToEmail = useCallback(async () => {
    const shareUrl = encodeBeatToUrl(grid, bpm);

    const subject = `🎵 Check out this beat I made!`;
    const body = `I just created this awesome beat on BeatKerri!\n\nPlay it here:\n${shareUrl}\n\nBeatKerri is a free online drum machine and beat maker.\nTry it at: https://beatkerri.com/jam`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    toast.success("Opening email to share beat!");
    setJamShareMenuOpen(false);
  }, [grid, bpm]);

  const handleJamShareToInstagram = useCallback(async () => {
    const shareUrl = encodeBeatToUrl(grid, bpm);

    const storyText = `🎵 Made this beat on BeatKerri! 🥁\n\n${shareUrl}\n\n#BeatKerri #BeatMaking #DrumMachine #MusicCreation`;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      try {
        await navigator.clipboard.writeText(storyText);
        window.location.href = `instagram://story-camera`;
        toast.success("Content copied! Opening Instagram Stories...", {
          duration: 5000,
        });
      } catch {
        toast(`📸 Copy this to your Instagram Story:\n\n${storyText}`, {
          duration: 8000,
        });
      }
    } else {
      try {
        await navigator.clipboard.writeText(storyText);
        toast.success("Instagram Story content copied! Paste it on mobile.", {
          duration: 6000,
        });
      } catch {
        alert(`Copy this to your Instagram Story:\n\n${storyText}`);
      }
    }
    setJamShareMenuOpen(false);
  }, [grid, bpm]);

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

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      stopPlaybackAudio();
      setIsPlaying(false);
    } else {
      await playPatternAudio(grid);
      setIsPlaying(true);
    }
  }, [isPlaying, stopPlaybackAudio, playPatternAudio, grid, setIsPlaying]);

  // Wrapped play function for controls
  const handlePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const toggleStep = async (row: number, col: number) => {
    toggleStepGrid(row, col);
    await playStep(row);
  };

  const handleBpmChange = (newBpm: number) => {
    const clampedBpm = Math.max(60, Math.min(200, newBpm));
    setBpm(clampedBpm);
    setBpmInput(clampedBpm.toString());
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
    setBpmInput(beat.bpm.toString());
    // Update the pattern in real-time if currently playing
    updatePattern(beat.grid);
    toast.success(`Loaded "${beat.name}"`);
  };

  const deleteBeat = (beatId: string) => {
    const updatedBeats = savedBeats.filter((beat) => beat.id !== beatId);
    setSavedBeats(updatedBeats);
    localStorage.setItem("jam_saved_beats", JSON.stringify(updatedBeats));
    toast.success("Beat deleted!");
  };

  // URL encoding/decoding for beat sharing
  const encodeBeatToUrl = (grid: boolean[][], bpm: number, name?: string) => {
    // Compress grid to a compact string format
    const compressedGrid = grid
      .map((row) => row.map((step) => (step ? "1" : "0")).join(""))
      .join("");

    const beatData = {
      g: compressedGrid, // grid (compressed)
      b: bpm, // bpm
      n: name || "Shared Beat", // name
    };

    // Encode as base64 URL parameter
    const encoded = btoa(JSON.stringify(beatData));
    return `${window.location.origin}/jam?beat=${encoded}`;
  };

  const decodeBeatFromUrl = (encodedBeat: string) => {
    try {
      const decoded = JSON.parse(atob(encodedBeat));
      const { g: compressedGrid, b: bpm, n: name } = decoded;

      // Decompress grid
      const grid = [];
      for (let i = 0; i < 7; i++) {
        const row = [];
        for (let j = 0; j < 16; j++) {
          row.push(compressedGrid[i * 16 + j] === "1");
        }
        grid.push(row);
      }

      return { grid, bpm, name };
    } catch (error) {
      console.error("Failed to decode beat from URL:", error);
      return null;
    }
  };



  const exportBeat = () => {
    const beatName =
      prompt("Enter a name for this beat (optional):", "Custom Beat") ||
      "Custom Beat";
    const author =
      prompt("Enter author name (optional):", "Unknown") || "Unknown";
    const description = prompt("Enter a description (optional):", "") || "";

    // Calculate beat statistics
    const totalNotes = grid.flat().filter(Boolean).length;
    const activeInstruments = grid
      .map((row, index) => ({
        index,
        name: [
          "Kick",
          "Snare",
          "Closed Hi-Hat",
          "Open Hi-Hat",
          "Low Tom",
          "High Tom",
          "Clap",
        ][index],
        notes: row.filter(Boolean).length,
        active: row.some(Boolean),
      }))
      .filter((inst) => inst.active);

    const currentDate = new Date();

    const beatData = {
      // Metadata
      formatVersion: "1.0",
      name: beatName,
      author: author,
      description: description,
      createdAt: currentDate.toISOString(),
      createdAtReadable: currentDate.toLocaleString(),

      // Beat Properties
      bpm: bpm,
      totalSteps: 16,
      totalNotes: totalNotes,

      // Instrument Mapping
      instruments: [
        { index: 0, name: "Kick", midi: 36, color: "#ef4444" },
        { index: 1, name: "Snare", midi: 38, color: "#f97316" },
        { index: 2, name: "Closed Hi-Hat", midi: 42, color: "#eab308" },
        { index: 3, name: "Open Hi-Hat", midi: 46, color: "#22c55e" },
        { index: 4, name: "Low Tom", midi: 45, color: "#3b82f6" },
        { index: 5, name: "High Tom", midi: 48, color: "#a855f7" },
        { index: 6, name: "Clap", midi: 39, color: "#ec4899" },
      ],

      // Active Instruments Summary
      activeInstruments: activeInstruments,

      // Pattern Data
      grid: grid,

      // Technical Data
      timestamp: Date.now(),
      source: "BeatKerri v1.0",

      // Usage Instructions
      _readme: {
        usage:
          "Import this file into BeatKerri Jam Mode using the Import button",
        format: "16-step sequencer pattern with 7 drum instruments",
        bpm: `Tempo is set to ${bpm} BPM`,
        instruments:
          "Each row represents: Kick, Snare, Closed HH, Open HH, Low Tom, High Tom, Clap",
      },
    };

    const dataStr = JSON.stringify(beatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${beatName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success(`Beat "${beatName}" exported with full metadata!`);
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

          // Validate that we have the required grid data
          if (!beatData.grid || !Array.isArray(beatData.grid)) {
            toast.error("Invalid beat file: Missing grid data!");
            return;
          }

          // Set the grid pattern (audio sync is automatic)
          setGrid(beatData.grid);

          // Set BPM (with fallback)
          const newBpm = beatData.bpm || 120;
          setBpm(newBpm);
          setBpmInput(newBpm.toString());

          // Show detailed import message based on format
          if (beatData.formatVersion && beatData.name) {
            // New comprehensive format
            const totalNotes =
              beatData.totalNotes ||
              beatData.grid.flat().filter(Boolean).length;
            const authorInfo =
              beatData.author && beatData.author !== "Unknown"
                ? ` by ${beatData.author}`
                : "";

            toast.success(
              `🎵 Imported "${beatData.name}"${authorInfo}! ${totalNotes} notes at ${newBpm} BPM`,
              { duration: 4000 }
            );

            // Log comprehensive info to console for debugging
            console.log("🎵 Imported beat with metadata:", {
              name: beatData.name,
              author: beatData.author,
              bpm: newBpm,
              notes: totalNotes,
              created: beatData.createdAtReadable,
              description: beatData.description,
            });
          } else {
            // Legacy simple format
            toast.success(`Beat imported! ${newBpm} BPM`);
          }
        } catch (error) {
          console.error("Beat import error:", error);
          toast.error("Invalid beat file format!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // WAV Export functionality
  const audioContextRef = useRef<AudioContext | null>(null);

  const generateWav = async () => {
    try {
      // Initialize audio context if not already done
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const sampleRate = audioContext.sampleRate;
      const stepsPerBeat = 4;
      const totalSteps = 16;
      const secondsPerStep = 60 / bpm / stepsPerBeat;
      const totalDuration = totalSteps * secondsPerStep;
      const totalSamples = Math.floor(totalDuration * sampleRate);

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(
        1,
        totalSamples,
        sampleRate
      );
      const channelData = audioBuffer.getChannelData(0);

      // Load drum samples
      const samples = await loadDrumSamples(audioContext);

      // Generate audio for each step
      for (let step = 0; step < totalSteps; step++) {
        const stepTime = step * secondsPerStep;
        const stepSample = Math.floor(stepTime * sampleRate);

        // Check each instrument for this step
        for (let instrument = 0; instrument < 7; instrument++) {
          if (grid[instrument][step] && samples[instrument]) {
            const sample = samples[instrument];
            const sampleLength = sample.length;

            // Add the sample to the audio buffer
            for (
              let i = 0;
              i < sampleLength && stepSample + i < totalSamples;
              i++
            ) {
              channelData[stepSample + i] += sample[i] * 0.3; // Reduce volume to prevent clipping
            }
          }
        }
      }

      // Convert to WAV
      const wavBlob = audioBufferToWav(audioBuffer);

      // Download the file
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `beat-${Date.now()}.wav`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("WAV file exported!");
    } catch (error) {
      console.error("Error generating WAV:", error);
      toast.error("Failed to generate WAV file");
    }
  };

  const loadDrumSamples = async (audioContext: AudioContext) => {
    const sampleUrls = [
      "/samples/kick.wav",
      "/samples/snare.wav",
      "/samples/closed_hihat.wav",
      "/samples/open_hihat.wav",
      "/samples/low_tom.wav",
      "/samples/high_tom.wav",
      "/samples/clap.wav",
    ];

    const samples: Float32Array[] = [];

    for (const url of sampleUrls) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        samples.push(audioBuffer.getChannelData(0));
      } catch (error) {
        console.error(`Failed to load sample ${url}:`, error);
        // Create a simple click sound as fallback
        const clickLength = Math.floor(0.01 * audioContext.sampleRate);
        const click = new Float32Array(clickLength);
        for (let i = 0; i < clickLength; i++) {
          click[i] = Math.sin(i * 0.1) * Math.exp(-i * 0.01);
        }
        samples.push(click);
      }
    }

    return samples;
  };

  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const buffer = audioBuffer.getChannelData(0);

    // WAV file header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + length * 2, true); // File size
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, length * 2, true); // Subchunk2Size

    // Combine header with audio data
    const audioData = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      audioData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    const wavBlob = new Blob([wavHeader, audioData], { type: "audio/wav" });
    return wavBlob;
  };

  // MIDI Event Types
  interface MidiEvent {
    deltaTime: number;
    type: string;
    microsecondsPerQuarter?: number;
    channel?: number;
    noteNumber?: number;
    velocity?: number;
  }

  // MIDI Export functionality
  const generateMidi = () => {
    try {
      // Standard General MIDI drum mapping
      const drumMap = [
        36, // Kick (Bass Drum 1)
        38, // Snare (Acoustic Snare)
        42, // Closed Hi-Hat
        46, // Open Hi-Hat
        45, // Low Tom (Low Floor Tom)
        48, // High Tom (Hi Mid Tom)
        39, // Clap (Hand Clap)
      ];

      // Calculate timing
      const ticksPerQuarter = 480; // Standard MIDI resolution
      const ticksPerStep = ticksPerQuarter / 4; // 16th notes

      // Create MIDI events
      const events: MidiEvent[] = [];

      // Add tempo event
      const microsecondsPerQuarter = Math.round(60000000 / bpm);
      events.push({
        deltaTime: 0,
        type: "setTempo",
        microsecondsPerQuarter: microsecondsPerQuarter,
      });

      // Add note events
      for (let step = 0; step < 16; step++) {
        for (let instrument = 0; instrument < 7; instrument++) {
          if (grid[instrument][step]) {
            const noteTime = step * ticksPerStep;

            // Note On
            events.push({
              deltaTime: noteTime,
              type: "noteOn",
              channel: 9, // MIDI channel 10 (0-indexed as 9) for drums
              noteNumber: drumMap[instrument],
              velocity: 100,
            });

            // Note Off (short duration)
            events.push({
              deltaTime: noteTime + ticksPerStep / 4,
              type: "noteOff",
              channel: 9,
              noteNumber: drumMap[instrument],
              velocity: 0,
            });
          }
        }
      }

      // Sort events by time
      events.sort((a, b) => a.deltaTime - b.deltaTime);

      // Convert to delta times
      let lastTime = 0;
      events.forEach((event) => {
        const currentTime = event.deltaTime;
        event.deltaTime = currentTime - lastTime;
        lastTime = currentTime;
      });

      // Create MIDI file
      const midiBlob = createMidiFile(events, ticksPerQuarter);

      // Download the file
      const url = URL.createObjectURL(midiBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `beat-${Date.now()}.mid`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("MIDI file exported!");
    } catch (error) {
      console.error("Error generating MIDI:", error);
      toast.error("Failed to generate MIDI file");
    }
  };

  const createMidiFile = (
    events: MidiEvent[],
    ticksPerQuarter: number
  ): Blob => {
    // Helper functions for MIDI file creation
    const writeVariableLength = (value: number): number[] => {
      const bytes: number[] = [];
      bytes.unshift(value & 0x7f);
      value >>= 7;
      while (value > 0) {
        bytes.unshift((value & 0x7f) | 0x80);
        value >>= 7;
      }
      return bytes;
    };

    const writeString = (text: string): number[] => {
      return Array.from(text).map((char) => char.charCodeAt(0));
    };

    const write32Bit = (value: number): number[] => {
      return [
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff,
      ];
    };

    const write16Bit = (value: number): number[] => {
      return [(value >> 8) & 0xff, value & 0xff];
    };

    // Create track data
    const trackData: number[] = [];

    events.forEach((event) => {
      // Add delta time
      trackData.push(...writeVariableLength(event.deltaTime));

      if (event.type === "setTempo") {
        // Meta event: Set Tempo
        trackData.push(0xff, 0x51, 0x03);
        const tempo = event.microsecondsPerQuarter || 500000; // Default to 120 BPM if undefined
        trackData.push((tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff);
      } else if (event.type === "noteOn") {
        trackData.push(
          0x90 | (event.channel || 9),
          event.noteNumber || 36,
          event.velocity || 100
        );
      } else if (event.type === "noteOff") {
        trackData.push(
          0x80 | (event.channel || 9),
          event.noteNumber || 36,
          event.velocity || 0
        );
      }
    });

    // End of track
    trackData.push(0x00, 0xff, 0x2f, 0x00);

    // Create MIDI file structure
    const midiData: number[] = [];

    // Header chunk
    midiData.push(...writeString("MThd"));
    midiData.push(...write32Bit(6)); // Header length
    midiData.push(...write16Bit(0)); // Format type 0
    midiData.push(...write16Bit(1)); // Number of tracks
    midiData.push(...write16Bit(ticksPerQuarter)); // Ticks per quarter note

    // Track chunk
    midiData.push(...writeString("MTrk"));
    midiData.push(...write32Bit(trackData.length)); // Track length
    midiData.push(...trackData);

    return new Blob([new Uint8Array(midiData)], { type: "audio/midi" });
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

  // Check for shared beat in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedBeat = urlParams.get("beat");

    if (sharedBeat) {
      const decoded = decodeBeatFromUrl(sharedBeat);
      if (decoded) {
        setGrid(decoded.grid);
        setBpm(decoded.bpm);
        setBpmInput(decoded.bpm.toString());

        toast.success(
          `🎵 Loaded shared beat: "${decoded.name}" (${decoded.bpm} BPM)`,
          { duration: 5000 }
        );

        // Clean the URL without triggering a page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else {
        toast.error("Invalid shared beat link!");
      }
    }
  }, [setGrid, setBpm, setBpmInput]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <p className="text-center text-sm text-gray-400 mt-4 mb-2 font-mono">
        Jam Mode: Create your own groove!
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
            <div className="text-xs font-mono text-gray-400">
              BPM
              <input
                type="number"
                min="60"
                max="200"
                value={bpmInput}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setBpmInput(inputValue);

                  const numValue = parseInt(inputValue);
                  if (!isNaN(numValue) && numValue >= 60 && numValue <= 200) {
                    setBpm(numValue);
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                    // Start playing the pattern at the new BPM
                    if (!isPlaying) {
                      await togglePlay();
                    }
                  }
                }}
                onBlur={() => {
                  const value = parseInt(bpmInput);
                  if (isNaN(value) || value < 60) {
                    handleBpmChange(60);
                  } else if (value > 200) {
                    handleBpmChange(200);
                  } else {
                    handleBpmChange(value);
                  }
                }}
                className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center focus:outline-none focus:border-gray-700"
              />
            </div>
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
          onTogglePlay={handlePlay}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onClearGrid={clearGrid}
          showShare={true}
          shareMenuOpen={jamShareMenuOpen}
          onToggleShareMenu={handleToggleJamShareMenu}
          onCopyShareLink={handleJamCopyShareLink}
          onShareToX={handleJamShareToX}
          onShareToFacebook={handleJamShareToFacebook}
          onShareToWhatsApp={handleJamShareToWhatsApp}
          onShareToEmail={handleJamShareToEmail}
          onShareToInstagram={handleJamShareToInstagram}
          shareMenuRef={jamShareMenuRef}
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
        <div className="absolute bottom-2 right-2">
          <Link
            href="/how-to-play#jam-mode"
            className="w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-300 border-2 border-gray-900 flex items-center justify-center transition-colors shadow-lg"
            onClick={() => playSubmitClick()}
            title="How To Play Jam Mode"
          >
            <HelpCircle size={16} className="text-gray-900" />
          </Link>
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
              Export JSON
            </button>
            <button
              onClick={generateWav}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded flex items-center gap-2 text-sm transition-colors"
            >
              <Music size={16} />
              Export WAV
            </button>
            <button
              onClick={generateMidi}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center gap-2 text-sm transition-colors"
            >
              <Piano size={16} />
              Export MIDI
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
