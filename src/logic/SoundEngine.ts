import * as Tone from 'tone';

export class SoundEngine {
  private static synth: Tone.PolySynth | null = null;
  private static isInitialized = false;

  private static successMessages = [
    'Good job!',
    'Great!',
    'Awesome!',
    'Correct!',
    'Perfect!',
    'Nice one!',
  ];

  private static failMessages = [
    'Oops!',
    'Try again!',
    'Not quite!',
    'Boo!',
    'Oh no!',
  ];

  public static async init() {
    if (this.isInitialized) return;
    try {
      await Tone.start();
      
      // "Unlock" SpeechSynthesis on mobile Safari by speaking an empty string on first user gesture
      if ('speechSynthesis' in window) {
        const unlockUtterance = new SpeechSynthesisUtterance('');
        unlockUtterance.volume = 0;
        window.speechSynthesis.speak(unlockUtterance);
      }
      // Use a PolySynth for simple tone generation
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.2,
          release: 1.5,
        },
      }).toDestination();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to initialize AudioContext', e);
    }
  }

  public static playNote(note: string, octave: number) {
    if (!this.synth || !this.isInitialized) return;
    const noteString = `${note}${octave}`;
    try {
      this.synth.triggerAttackRelease(noteString, '8n');
    } catch (e) {
      console.warn(`Could not play note ${noteString}`, e);
    }
  }

  public static playSuccessSound() {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech so they don't overlap awkwardly
    window.speechSynthesis.cancel();

    const message = this.successMessages[Math.floor(Math.random() * this.successMessages.length)];
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Try to find a nice vocal, e.g. a friendly English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      // Prefer Google or native voices, but any default English will do
      utterance.voice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')) || englishVoices[0];
    }
    
    utterance.rate = 1.1; // Slightly faster for excitement
    utterance.pitch = 1.2; // Slightly higher pitch
    window.speechSynthesis.speak(utterance);
  }

  public static playFailSound() {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();

    const message = this.failMessages[Math.floor(Math.random() * this.failMessages.length)];
    const utterance = new SpeechSynthesisUtterance(message);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')) || englishVoices[0];
    }
    
    utterance.rate = 1.0; 
    utterance.pitch = 0.8; // Lower pitch for failure
    window.speechSynthesis.speak(utterance);
  }
}
