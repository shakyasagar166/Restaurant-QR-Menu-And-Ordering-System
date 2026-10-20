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

  // Soft tactile ping when adding item to cart / tray
  playCartAddSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High-pitched gentle bubble pop (approx 987.77Hz - B5 up to 1318Hz - E6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (err) {
      // Audio is non-critical, swallow silently
    }
  }

  // Success completion chord (Grand celebration)
  playSuccessSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // C-Major chord (C5, E5, G5, C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        this.createChimeTone(ctx, freq, now + (idx * 0.05), 0.8, 0.15);
      });
    } catch (err) {
      // Audio is non-critical, swallow silently
    }
  }

  // Urgent kitchen attention chime for delayed orders (>15 mins)
  playUrgentAlert() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      this.createChimeTone(ctx, 880, now, 0.25, 0.35); // A5
      this.createChimeTone(ctx, 880, now + 0.3, 0.25, 0.35); // A5 second pulse
    } catch (err) {
      // Non-critical
    }
  }

  // Native mobile haptic vibration helper
  triggerHaptic(pattern = [25]) {
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
      }
    } catch (err) {
      // Haptics not supported or restricted, ignore
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
