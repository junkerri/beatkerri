"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, Music, Zap, Sparkles } from "lucide-react";

interface SynthSound {
  name: string;
  frequency: number;
  type: OscillatorType;
  duration: number;
  icon: React.ReactNode;
  color: string;
}

const synthSounds: SynthSound[] = [
  {
    name: "Saw Wave",
    frequency: 220,
    type: "sawtooth",
    duration: 0.5,
    icon: <Zap className="w-4 h-4" />,
    color: "bg-red-600 hover:bg-red-500",
  },
  {
    name: "Square Wave",
    frequency: 330,
    type: "square",
    duration: 0.4,
    icon: <Music className="w-4 h-4" />,
    color: "bg-blue-600 hover:bg-blue-500",
  },
  {
    name: "Sine Wave",
    frequency: 440,
    type: "sine",
    duration: 0.6,
    icon: <Volume2 className="w-4 h-4" />,
    color: "bg-green-600 hover:bg-green-500",
  },
  {
    name: "Triangle Wave",
    frequency: 550,
    type: "triangle",
    duration: 0.5,
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-purple-600 hover:bg-purple-500",
  },
];

export const SynthButtons = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const oscillators = useRef<Map<string, OscillatorNode>>(new Map());

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        setAudioContext(ctx);
      }
    };

    // Add event listeners for user interaction
    const events = ["click", "touchstart", "keydown"];
    const handleInteraction = () => {
      initAudio();
      events.forEach((event) =>
        document.removeEventListener(event, handleInteraction)
      );
    };

    events.forEach((event) =>
      document.addEventListener(event, handleInteraction, { once: true })
    );

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleInteraction)
      );
    };
  }, [audioContext]);

  const playSound = async (sound: SynthSound) => {
    if (!audioContext) return;

    // Resume audio context if suspended
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    // Stop any existing oscillator for this sound
    const existingOsc = oscillators.current.get(sound.name);
    if (existingOsc) {
      existingOsc.stop();
      oscillators.current.delete(sound.name);
    }

    // Create new oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(
      sound.frequency,
      audioContext.currentTime
    );

    // Add some envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + sound.duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);

    // Store oscillator reference
    oscillators.current.set(sound.name, oscillator);

    // Set playing state
    setIsPlaying(sound.name);

    // Clear playing state after duration
    setTimeout(() => {
      setIsPlaying(null);
      oscillators.current.delete(sound.name);
    }, sound.duration * 1000);
  };

  return (
    <div className="mt-8 mb-6">
      <h3 className="text-center text-gray-400 font-mono text-sm mb-4">
        Try the Classic Synth Sounds
      </h3>
      <div className="flex justify-center gap-3 flex-wrap">
        {synthSounds.map((sound) => (
          <button
            key={sound.name}
            onClick={() => playSound(sound)}
            disabled={isPlaying === sound.name}
            className={`
              ${sound.color} 
              ${isPlaying === sound.name ? "animate-pulse" : ""}
              text-white px-4 py-3 rounded-lg font-mono text-sm
              flex items-center gap-2 transition-all duration-200
              shadow-lg hover:shadow-xl transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {sound.icon}
            <span>{sound.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
