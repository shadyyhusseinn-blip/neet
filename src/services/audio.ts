/**
 * Audio service for UI feedback
 */

class AudioService {
  private audioContext: AudioContext | null = null;

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a premium tick sound (replaces the old click)
   */
  playClick() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Deeper, softer tick
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.04);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.04);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play a soft pop sound for opening elements
   */
  playPop() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.12);

      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.12);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play an error sound
   */
  playError() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.25);

      gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.25);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play a success sound - majestic chime
   */
  playSuccess() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;

      // Chord chime
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, i) => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.05, now + i * 0.05 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
        
        osc.connect(gain);
        gain.connect(this.audioContext!.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play a delete/trash sound
   */
  playDelete() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }
  /**
   * Play a premium notification chime
   */
  playNotification() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;
      
      // First tone
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Second tone (delayed)
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.1); // D6
      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.6);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play a subtle hover tick
   */
  playHover() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(2500, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.01);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.01);
    } catch (error) {
      // Silent fail for hover
    }
  }

  /**
   * Play a mechanical switch sound
   */
  playSwitch(on: boolean = true) {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(on ? 800 : 600, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(on ? 1200 : 400, this.audioContext.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play a data processing / sync sound
   */
  playData() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000 + (i * 500), now + (i * 0.05));
        gain.gain.setValueAtTime(0.01, now + (i * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.05) + 0.03);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now + (i * 0.05));
        osc.stop(now + (i * 0.05) + 0.03);
      }
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }

  /**
   * Play a cinematic camera shutter sound
   */
  playShutter() {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;
      
      // Component 1: The initial mechanical mirror flip (Low thud)
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      // Component 2: The high-frequency shutter curtain click (Noise)
      const bufferSize = this.audioContext.sampleRate * 0.1;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2000, now);
      const noiseGain = this.audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.audioContext.destination);
      noise.start(now);
      noise.stop(now + 0.08);

      // Component 3: The reset "clack" (Slightly delayed)
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(600, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(300, now + 0.18);
      gain2.gain.setValueAtTime(0.03, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.18);
      
    } catch (error) {
      console.warn('Shutter sound failed:', error);
    }
  }
}

export const audioService = new AudioService();
