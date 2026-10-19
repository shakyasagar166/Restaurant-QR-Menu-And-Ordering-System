// Web Audio API based Restaurant Kitchen Order Bell
// Does not depend on external MP3 files - works 100% offline and reliably!

class BellSoundPlayer {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a 2-tone Brass Hotel / Kitchen Bell (Ding-Dong)
  playOrderBell() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Tone 1: High crisp 'Ding' (approx 830Hz - G#5)
      this.createChimeTone(ctx, 830.6, now, 0.9, 0.4);

      // Tone 2: Harmonious resonance 'Dong' (approx 587Hz - D5)
      this.createChimeTone(ctx, 587.3, now + 0.28, 1.4, 0.45);
    } catch (err) {
      console.warn("Could not play bell sound:", err);
    }
  }

  // Single counter bell strike
  playSingleBell() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      this.createChimeTone(ctx, 1046.5, now, 1.2, 0.4); // C6 clear bell
    } catch (err) {
      console.warn("Could not play bell sound:", err);
    }
  }

  createChimeTone(ctx, frequency, startTime, duration, maxGain) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Exponential sound decay like a real brass bell
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(maxGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const bellPlayer = new BellSoundPlayer();
