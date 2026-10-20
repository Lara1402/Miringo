/**
 * Web Audio API synthesizer for the MSOT Cinematic Intro Animation.
 * Synthesizes dynamic cinematic sound effects without external audio asset dependencies:
 * - Sub-bass drone & rising charge (Energy Core stage)
 * - Majestic ambient harmonic synth chord (Brand Reveal stage)
 * - Lowpass filter sweep & warp whoosh (Portal Expansion stage)
 * - High sparkle chimes & resolution tones (Login stage)
 */

class IntroAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Check if user previously muted intro sound
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('msot_intro_muted') === 'true';
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('msot_intro_muted', muted ? 'true' : 'false');
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
    if (!muted) {
      this.resume();
    }
  }

  public resume() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Stage 1: Energy formation
   * Deep rising sub-bass swell with energy charge-up
   */
  public playEnergyCharge() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(90, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.7);

    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.7);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.8);

    // Shimmering particle ticks
    this.playSparkle(now + 0.15, 1400);
    this.playSparkle(now + 0.3, 1900);
    this.playSparkle(now + 0.45, 2400);
  }

  /**
   * Stage 2: Brand Reveal (MSOT Logo)
   * Majestic futuristic synth chord (D-F#-A-C#-E) with crystalline resonance
   */
  public playBrandReveal() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const chordFrequencies = [146.83, 220.0, 369.99, 554.37, 659.25, 880.0];
    chordFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.025);

      gain.gain.setValueAtTime(0.001, now + idx * 0.025);
      gain.gain.linearRampToValueAtTime(0.18 / Math.sqrt(idx + 1), now + idx * 0.025 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.025);
      osc.stop(now + 1.35);
    });

    // High crystalline shimmer
    this.playSparkle(now + 0.05, 2800);
    this.playSparkle(now + 0.2, 3500);
    this.playSparkle(now + 0.35, 4200);
  }

  /**
   * Stage 3: Portal Expansion
   * Deep frequency sweep and cosmic whoosh
   */
  public playPortalWarp() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.65);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.65);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  /**
   * Stage 4: Resolution / Completion
   * Soft sparkling chime upon reaching the application
   */
  public playResolution() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.45);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  // ==========================================================
  // GTA V "LOS SANTOS: MSOT EDITION" SOUND FX (SYNTHESIZED)
  // ==========================================================

  /**
   * GTA V Character Switch Satellite Zoom Swoosh
   * High altitude camera rush with Doppler filter sweep + radio static burst
   */
  public playCharacterSwitch() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Rising Doppler Whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(65, now + 1.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);

    // 2. Radio Static Burst (White Noise)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1800, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now + 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      whiteNoise.start(now + 0.4);
    } catch {
      // Ignore static burst failure
    }

    // 3. Ground Impact Thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now + 1.1);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 1.5);
    subGain.gain.setValueAtTime(0.3, now + 1.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now + 1.1);
    subOsc.stop(now + 1.65);
  }

  /**
   * GTA V Mission Passed Fanfare (Black & Gold Respect +)
   * Multi-voice brass triumph chords with rich harmonic bloom
   */
  public playMissionPassed() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Brass Triumph Chord (Bb Major into F Major Fanfare)
    const notes = [
      { f: 116.54, t: 0.0, dur: 1.8, vol: 0.25 }, // Bb2
      { f: 233.08, t: 0.0, dur: 1.8, vol: 0.2 },  // Bb3
      { f: 293.66, t: 0.05, dur: 1.6, vol: 0.18 }, // D4
      { f: 349.23, t: 0.1, dur: 1.7, vol: 0.18 },  // F4
      { f: 466.16, t: 0.15, dur: 1.8, vol: 0.22 }, // Bb4
      { f: 587.33, t: 0.2, dur: 2.0, vol: 0.25 },  // D5
      { f: 698.46, t: 0.25, dur: 2.2, vol: 0.28 }, // F5 (Peak Triumph)
    ];

    notes.forEach((n) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now + n.t);
      filter.frequency.exponentialRampToValueAtTime(2800, now + n.t + 0.15);
      filter.frequency.exponentialRampToValueAtTime(800, now + n.t + n.dur);

      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.dur + 0.1);
    });

    // Sub-bass impact slam
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(95, now);
    boomOsc.frequency.exponentialRampToValueAtTime(32, now + 0.9);
    boomGain.gain.setValueAtTime(0.35, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    boomOsc.connect(boomGain);
    boomGain.connect(this.masterGain);
    boomOsc.start(now);
    boomOsc.stop(now + 1.1);

    // Gold sparkle chimes
    this.playSparkle(now + 0.35, 1800);
    this.playSparkle(now + 0.5, 2400);
    this.playSparkle(now + 0.65, 3200);
  }

  /**
   * GTA V Weapon / Action Wheel Tick
   * Snappy mechanical click for UI navigation
   */
  public playWeaponWheelTick() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * GTA V Wasted / Busted Low Piano Hit
   * Ominous hit when streak is broken or test failed
   */
  public playWasted() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const bass = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    bass.type = 'sawtooth';
    sub.type = 'sine';

    bass.frequency.setValueAtTime(55, now);
    sub.frequency.setValueAtTime(27.5, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    bass.connect(gain);
    sub.connect(gain);
    gain.connect(this.masterGain);

    bass.start(now);
    sub.start(now);
    bass.stop(now + 1.9);
    sub.stop(now + 1.9);
  }

  /**
   * GTA V Wanted Star Siren / Ping
   * 2-tone police siren chirp when wanted level increases or max streak is achieved
   */
  public playWantedPing() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1174, now + 0.12);
    osc.frequency.linearRampToValueAtTime(880, now + 0.24);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  private playSparkle(startTime: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, startTime + 0.08);

      gain.gain.setValueAtTime(0.04, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    } catch {
      // Ignore transient audio node errors
    }
  }

  public cleanup() {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Ignore
      }
      this.ctx = null;
    }
  }
}

export const introAudio = new IntroAudioManager();
