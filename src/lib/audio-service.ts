const SFX_URLS = {
  EQUIP_NORMAL: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3',
  EQUIP_LEGENDARY: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-rolling-and-crackling-1282.mp3',
  BUY_ITEM: 'https://assets.mixkit.co/sfx/preview/mixkit-clinking-coins-735.mp3',
  CORRUPTION_GAINED: 'https://assets.mixkit.co/sfx/preview/mixkit-dark-magic-horror-whoosh-1488.mp3'
};

class AudioService {
  private static instance: AudioService;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private initialized = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Warm-up sounds on first interaction
      window.addEventListener('click', () => this.init(), { once: true });
    }
  }

  public init() {
    if (this.initialized) return;
    console.log('[AudioService] Initializing audio context...');
    
    // Create dummy buffer to wake up audio on mobile/Brave
    Object.keys(SFX_URLS).forEach(key => {
      const type = key as keyof typeof SFX_URLS;
      if (!this.sounds.has(type)) {
        const audio = new Audio(SFX_URLS[type]);
        audio.volume = 0;
        audio.play().then(() => {
          audio.pause();
          audio.volume = 1;
          audio.currentTime = 0;
        }).catch(() => {});
        this.sounds.set(type, audio);
      }
    });

    this.initialized = true;
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public playSound(type: keyof typeof SFX_URLS) {
    if (typeof window === 'undefined') return;
    if (!this.initialized) this.init();

    console.log(`[AudioService] Requesting sound: ${type}`);

    try {
      let audio = this.sounds.get(type);
      
      if (!audio) {
        audio = new Audio(SFX_URLS[type]);
        this.sounds.set(type, audio);
      }

      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`[AudioService] Play blocked for ${type}:`, error);
        });
      }
    } catch (error) {
      console.error(`[AudioService] Critical failure playing ${type}:`, error);
    }
  }
}

export const audioService = AudioService.getInstance();
