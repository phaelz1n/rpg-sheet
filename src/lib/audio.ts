export const playCheckSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05); // Muito baixinho
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
