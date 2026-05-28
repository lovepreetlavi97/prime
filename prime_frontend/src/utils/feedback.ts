/**
 * Premium Feedback Utility
 * Handles cross-platform haptics and synthesized tech sounds.
 */

let globalAudioContext: AudioContext | null = null;

export const playTechClick = (volume = 0.2) => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }
    
    const ctx = globalAudioContext!;
    
    // Resume context if suspended (common on mobile)
    if (ctx.state === 'suspended') {
      ctx.resume();
      // On mobile, first resume MUST happen in user interaction.
      // If we are here via a socket event, it might fail, 
      // so we should have a global click listener to resume it.
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio feedback failed:', e);
  }
};

// GLOBAL LISTENER TO UNLOCK AUDIO ON MOBILE
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
      globalAudioContext.resume();
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock);
  window.addEventListener('touchstart', unlock);
}


export const triggerHaptic = (duration = 30) => {
  if (typeof window === 'undefined') return;

  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};

export const triggerSignalFeedback = (settings: { sound: boolean; haptics: boolean }) => {
  if (settings.haptics) triggerHaptic(30);
  if (settings.sound) {
      // Wait for interaction if needed (handled by browser usually)
      playTechClick();
  }
};
