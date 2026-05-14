const SFX_URLS = {
  EQUIP_NORMAL: 'https://www.soundjay.com/buttons/sounds/button-20.mp3', // Metal click
  EQUIP_LEGENDARY: 'https://www.soundjay.com/nature/sounds/thunder-crack-01.mp3', // Thunder
  BUY_ITEM: 'https://www.soundjay.com/misc/sounds/coin-spade-1.mp3', // Coins
  CORRUPTION_GAINED: 'https://www.soundjay.com/button/sounds/button-10.mp3' // Whoosh (placeholder)
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
