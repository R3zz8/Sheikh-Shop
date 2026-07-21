/**
 * Synthesized Luxury Audio System using Web Audio API
 * Procedural audio generation designed for Rolex/Apple-like physical luxury cues.
 * Ensures 100% reliability, zero external asset dependencies, and respects browser autoplay policies.
 */

class LuxuryAudioSystem {
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    return new AudioContextClass();
  }

  /**
   * Premium metallic click sound for lock unlock or button clicks
   */
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Silent catch for browser blocking policies
    }
  }

  /**
   * Metallic lock unlock slide click sound
   */
  public playUnlock() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const time = ctx.currentTime;
      // First click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(350, time);
      osc1.frequency.setValueAtTime(600, time + 0.04);
      gain1.gain.setValueAtTime(0.05, time);
      gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(time + 0.15);

      // Second slide latch release
      setTimeout(() => {
        const ctx2 = this.getContext();
        if (!ctx2) return;
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, ctx2.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(880, ctx2.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.06, ctx2.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.2);

        osc2.connect(gain2);
        gain2.connect(ctx2.destination);
        osc2.start();
        osc2.stop(ctx2.currentTime + 0.22);
      }, 150);
    } catch (e) {
      // Silent catch
    }
  }

  /**
   * Wooden/soft friction box opening sweep
   */
  public playBoxOpen() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const time = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.9);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(time + 0.95);
    } catch (e) {
      // Silent catch
    }
  }

  /**
   * Celestial golden chime arpeggio for sparkles
   */
  public playSparkle() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6 (Celestial C Major chord)
      const baseTime = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = index * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, baseTime + delay);
        gain.gain.setValueAtTime(0.03, baseTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, baseTime + delay + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(baseTime + delay);
        osc.stop(baseTime + delay + 0.45);
      });
    } catch (e) {
      // Silent catch
    }
  }
}

export const luxuryAudio = new LuxuryAudioSystem();
