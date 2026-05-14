class AudioService {
  private static instance: AudioService;
  private audioCtx: AudioContext | null = null;
  private initialized = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.init(), { once: true });
      window.addEventListener('keydown', () => this.init(), { once: true });
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public init() {
    if (this.initialized) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.initialized = true;
      console.log('[AudioService] WebAudio Context Initialized');
    } catch (e) {
      console.error('[AudioService] Failed to init AudioContext', e);
    }
  }

  private createNoiseBuffer(duration: number) {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * duration;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private lastPlayTimes: Record<string, number> = {};

  public playSound(type: string) {
    if (!this.initialized) this.init();
    if (!this.audioCtx) return;

    // Prevenção de repetição rápida (debounce)
    const nowReal = Date.now();
    if (this.lastPlayTimes[type] && nowReal - this.lastPlayTimes[type] < 300) {
      return;
    }
    this.lastPlayTimes[type] = nowReal;

    const now = this.audioCtx.currentTime;
    console.log(`[AudioService] Playing sound: ${type}`);

    if (type === 'EQUIP_LEGENDARY') {
      this.playCustomFile('/sfx/lightning-effects.mp3', 2.0); // 2.0s offset solicitado
      return;
    }

    switch (type) {
      case 'EQUIP_NORMAL':
        this.playClick(now);
        break;
      case 'BUY_ITEM':
        this.playCoins(now);
        break;
      case 'CORRUPTION_GAINED':
        this.playWhoosh(now);
        break;
    }
  }

  private playCustomFile(url: string, startOffset = 0) {
    const audio = new Audio(url);
    audio.currentTime = startOffset;
    audio.play().catch(e => console.error('[AudioService] File play failed', e));
  }

  private playClick(now: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playThunder(now: number) {
    if (!this.audioCtx) return;
    const noise = this.audioCtx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(2);
    if (!noiseBuffer) return;
    
    noise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 1.5);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(now);

    // Add a sharp "crack" at the start
    const crack = this.audioCtx.createOscillator();
    const crackGain = this.audioCtx.createGain();
    crack.type = 'sawtooth';
    crack.frequency.setValueAtTime(60, now);
    crackGain.gain.setValueAtTime(0.5, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    crack.connect(crackGain);
    crackGain.connect(this.audioCtx.destination);
    crack.start(now);
    crack.stop(now + 0.2);
  }

  private playCoins(now: number) {
    if (!this.audioCtx) return;
    for (let i = 0; i < 3; i++) {
      const time = now + i * 0.1;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 + Math.random() * 500, time);
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.1);
    }
  }

  private playWhoosh(now: number) {
    if (!this.audioCtx) return;
    const noise = this.audioCtx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(0.5);
    if (!noiseBuffer) return;
    noise.buffer = noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.5);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    noise.start(now);
  }
}

export const audioService = AudioService.getInstance();
