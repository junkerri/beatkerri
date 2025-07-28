class SoundscapeManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private currentAudio: HTMLAudioElement | null = null;
  private isMuted = false;
  private volume = 0.3; // Default volume (30%)
  private listeners: { [key: string]: HTMLAudioElement } = {};

  private initAudioContext() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn("Audio context not supported for soundscapes");
    }
  }

  // Load and cache audio files
  private async loadAudio(path: string): Promise<HTMLAudioElement> {
    if (this.listeners[path]) {
      return this.listeners[path];
    }

    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = this.volume;

    // Cache the audio element
    this.listeners[path] = audio;

    return audio;
  }

  // Play a soundscape with optional looping
  async playSoundscape(
    path: string,
    options: {
      loop?: boolean;
      fadeIn?: boolean;
      fadeOut?: boolean;
      crossfade?: boolean;
    } = {}
  ) {
    try {
      this.initAudioContext();

      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const audio = await this.loadAudio(path);

      // Stop current audio if crossfading
      if (options.crossfade && this.currentAudio) {
        this.fadeOutAudio(this.currentAudio);
      } else if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      // Set audio properties
      audio.loop = options.loop || false;
      audio.volume = this.isMuted ? 0 : this.volume;

      // Fade in if requested
      if (options.fadeIn) {
        audio.volume = 0;
        audio.play();
        this.fadeInAudio(audio);
      } else {
        audio.play();
      }

      this.currentAudio = audio;
    } catch (error) {
      console.warn("Could not play soundscape:", path, error);
    }
  }

  // Fade in audio
  private fadeInAudio(audio: HTMLAudioElement, duration: number = 2000) {
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = this.volume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, this.volume);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  // Fade out audio
  private fadeOutAudio(audio: HTMLAudioElement, duration: number = 1000) {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = audio.volume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(audio.volume - volumeStep, 0);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
      }
    }, stepDuration);
  }

  // Stop current soundscape
  stopSoundscape(fadeOut: boolean = true) {
    if (this.currentAudio) {
      if (fadeOut) {
        this.fadeOutAudio(this.currentAudio);
      } else {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      this.currentAudio = null;
    }
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update current audio volume
    if (this.currentAudio && !this.isMuted) {
      this.currentAudio.volume = this.volume;
    }

    // Update cached audio volumes
    Object.values(this.listeners).forEach((audio) => {
      if (!this.isMuted) {
        audio.volume = this.volume;
      }
    });
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.currentAudio) {
      this.currentAudio.volume = this.isMuted ? 0 : this.volume;
    }

    Object.values(this.listeners).forEach((audio) => {
      audio.volume = this.isMuted ? 0 : this.volume;
    });
  }

  // Get current mute state
  getMuteState(): boolean {
    return this.isMuted;
  }

  // Get current volume
  getVolume(): number {
    return this.volume;
  }

  // Preload all soundscapes
  async preloadSoundscapes() {
    const soundscapes = [
      "/audio/main-page-ambient.mp3",
      "/audio/victory/beatdle-win.mp3",
      "/audio/victory/challenge-win.mp3",
      "/audio/victory/perfect-solve.mp3",
      "/audio/loss/beatdle-loss.mp3",
      "/audio/loss/challenge-loss.mp3",
      "/audio/transitions/game-start.mp3",
      "/audio/transitions/mode-switch.mp3",
    ];

    try {
      await Promise.all(soundscapes.map((path) => this.loadAudio(path)));
      console.log("All soundscapes preloaded successfully");
    } catch (error) {
      console.warn("Some soundscapes failed to preload:", error);
    }
  }

  // Clean up resources
  dispose() {
    this.stopSoundscape(false);
    Object.values(this.listeners).forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    this.listeners = {};

    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create a singleton instance
export const soundscapeManager = new SoundscapeManager();

// Convenience functions for common soundscape scenarios
export const playMainPageAmbient = () =>
  soundscapeManager.playSoundscape("/audio/main-page-ambient.mp3", {
    loop: true,
    fadeIn: true,
  });

export const playVictorySoundscape = (
  mode: "beatdle" | "challenge",
  isPerfect: boolean = false
) => {
  let path = `/audio/victory/${mode}-win.mp3`;
  if (isPerfect && mode === "beatdle") {
    path = "/audio/victory/perfect-solve.mp3";
  }
  return soundscapeManager.playSoundscape(path, { fadeIn: true });
};

export const playLossSoundscape = (mode: "beatdle" | "challenge") =>
  soundscapeManager.playSoundscape(`/audio/loss/${mode}-loss.mp3`, {
    fadeIn: true,
  });

export const playGameStart = () =>
  soundscapeManager.playSoundscape("/audio/transitions/game-start.mp3");

export const playModeSwitch = () =>
  soundscapeManager.playSoundscape("/audio/transitions/mode-switch.mp3");

export const stopAllSoundscapes = () => soundscapeManager.stopSoundscape(true);
