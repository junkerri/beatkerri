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
    this.playClickSound(1000, "sine", 0.12);
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
