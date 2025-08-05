import toast from "react-hot-toast";

// MIDI Event Types
interface MidiEvent {
  deltaTime: number;
  type: string;
  microsecondsPerQuarter?: number;
  channel?: number;
  noteNumber?: number;
  velocity?: number;
}

/**
 * Export pattern as MIDI file
 */
export const exportMidiFile = (
  grid: boolean[][],
  bpm: number,
  filename?: string
) => {
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
    link.download = filename || `beatdle-${Date.now()}.mid`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("MIDI file exported!");
  } catch (error) {
    console.error("Error generating MIDI:", error);
    toast.error("Failed to generate MIDI file");
  }
};

/**
 * Export pattern as WAV file
 */
export const exportWavFile = async (
  grid: boolean[][],
  bpm: number,
  filename?: string
) => {
  try {
    // Initialize audio context
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const sampleRate = audioContext.sampleRate;
    const stepsPerBeat = 4;
    const totalSteps = 16;
    const secondsPerStep = 60 / bpm / stepsPerBeat;
    const totalDuration = totalSteps * secondsPerStep;
    const totalSamples = Math.floor(totalDuration * sampleRate);

    // Create audio buffer
    const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
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
    link.download = filename || `beatdle-${Date.now()}.wav`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("WAV file exported!");
  } catch (error) {
    console.error("Error generating WAV:", error);
    toast.error("Failed to generate WAV file");
  }
};

// Helper functions

const createMidiFile = (events: MidiEvent[], ticksPerQuarter: number): Blob => {
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
