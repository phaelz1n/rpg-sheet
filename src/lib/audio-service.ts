const SFX_URLS = {
  EQUIP_NORMAL: 'https://www.soundjay.com/buttons/sounds/button-20.mp3', // Metal click
  EQUIP_LEGENDARY: 'https://www.soundjay.com/nature/sounds/thunder-crack-01.mp3', // Thunder
  BUY_ITEM: 'https://www.soundjay.com/misc/sounds/coin-spade-1.mp3', // Coins
  CORRUPTION_GAINED: 'https://www.soundjay.com/button/sounds/button-10.mp3' // Whoosh (placeholder)
};

class AudioService {
  private static instance: AudioService;
  private sounds: Map<string, HTMLAudioElement> = new Map();

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public playSound(type: keyof typeof SFX_URLS) {
    if (typeof window === 'undefined') return;
    console.log(`[AudioService] Playing sound: ${type}`);

    try {
      let audio = this.sounds.get(type);
      
      if (!audio) {
        console.log(`[AudioService] Loading new audio for: ${type}`);
        audio = new Audio(SFX_URLS[type]);
        audio.preload = 'auto';
        this.sounds.set(type, audio);
      }

      audio.currentTime = 0;
      audio.play().catch(err => {
        console.error(`[AudioService] Error playing ${type}:`, err);
      });
    } catch (error) {
      console.error(`[AudioService] Failed to play sound ${type}:`, error);
    }
  }
}

export const audioService = AudioService.getInstance();
