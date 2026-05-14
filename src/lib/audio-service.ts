const SFX_URLS = {
  EQUIP_NORMAL: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3527873c5.mp3', // Metal click
  EQUIP_LEGENDARY: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c89657096e.mp3', // Thunder
  BUY_ITEM: 'https://cdn.pixabay.com/audio/2021/08/04/audio_332f1b4028.mp3', // Coins
  CORRUPTION_GAINED: 'https://cdn.pixabay.com/audio/2022/01/18/audio_8e78262705.mp3' // Dark whisper/whoosh
};

class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private soundBuffers: Map<string, AudioBuffer> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public async playSound(type: keyof typeof SFX_URLS) {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      let buffer = this.soundBuffers.get(type);
      
      if (!buffer) {
        const response = await fetch(SFX_URLS[type]);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.soundBuffers.set(type, buffer);
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }
}

export const audioService = AudioService.getInstance();
