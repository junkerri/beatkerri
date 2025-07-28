class ClickSoundManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  private initAudioContext() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn("Audio context not supported");
    }
  }

  private playClickSound(
    frequency: number,
    type: OscillatorType = "sine",
    duration: number = 0.1
  ) {
    if (!this.audioContext) return;

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );

    // Quick envelope for click sound
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.1,
      this.audioContext.currentTime + 0.001
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playRetroClick() {
    if (!this.audioContext) return;

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;

    // Create a retro drum machine-style click
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Retro click characteristics
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(120, now);
    oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.05);

    // Filter for that vintage sound
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(8, now);

    // Quick envelope for snappy click
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  // Different click sounds for different types of interactions
  playButtonClick() {
    this.initAudioContext();
    this.playClickSound(800, "sine", 0.08);
  }

  playToggleClick() {
    this.initAudioContext();
    this.playClickSound(600, "square", 0.06);
  }

  playSubmitClick() {
    this.initAudioContext();
    this.playRetroClick(); // Retro sound for submit/wrong attempts
  }

  playClearClick() {
    this.initAudioContext();
    this.playClickSound(400, "sawtooth", 0.1);
  }

  playNavigationClick() {
    this.initAudioContext();
    this.playClickSound(500, "triangle", 0.07);
  }
}

// Create a singleton instance
export const clickSounds = new ClickSoundManager();

// Convenience functions
export const playButtonClick = () => clickSounds.playButtonClick();
export const playToggleClick = () => clickSounds.playToggleClick();
export const playSubmitClick = () => clickSounds.playSubmitClick();
export const playClearClick = () => clickSounds.playClearClick();
export const playNavigationClick = () => clickSounds.playNavigationClick();
