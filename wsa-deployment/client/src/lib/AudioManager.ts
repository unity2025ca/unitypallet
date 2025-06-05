/**
 * Advanced Audio Manager for handling notification sounds
 * with browser autoplay policy workarounds
 */

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private soundBuffer: AudioBuffer | null = null;
  private soundEnabled = true;
  private soundLoaded = false;
  private soundUrl = '/notification-sound.mp3';
  private userInteracted = false;

  // Private constructor for singleton pattern
  private constructor() {
    // Initialize when possible
    this.initAudioContext();
    // Try to preload sound
    this.loadSound();
    // Set up user interaction detection
    this.setupInteractionListeners();
  }

  // Singleton pattern getter
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Initialize audio context with fallbacks
  private initAudioContext(): void {
    try {
      // Create audio context with fallbacks for different browsers
      window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      
      if (window.AudioContext) {
        this.audioContext = new AudioContext();
        console.log('AudioContext initialized successfully');
      } else {
        console.warn('AudioContext not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  // Load the notification sound file into buffer
  private async loadSound(): Promise<void> {
    if (!this.audioContext) {
      console.warn('Cannot load sound: AudioContext not available');
      return;
    }

    try {
      // Fetch the sound file
      const response = await fetch(this.soundUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sound file: ${response.status} ${response.statusText}`);
      }
      
      // Get audio data as ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      this.soundBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.soundLoaded = true;
      console.log('Notification sound loaded successfully');
    } catch (error) {
      console.error('Error loading notification sound:', error);
    }
  }

  // Setup listeners for user interaction to enable audio
  private setupInteractionListeners(): void {
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    
    const handleInteraction = () => {
      if (this.userInteracted) return;
      
      this.userInteracted = true;
      console.log('User interaction detected, audio should work now');
      
      // Resume audio context if it was suspended
      this.resumeAudioContext();
      
      // Remove listeners after first interaction
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
    
    // Add listeners for user interaction events
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction);
    });
  }

  // Resume audio context if it was suspended (common in modern browsers)
  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed successfully');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  }

  // Play notification sound
  public async playSound(): Promise<boolean> {
    // Return early if sound is disabled or not loaded
    if (!this.soundEnabled) {
      console.log('Notification sound is disabled');
      return false;
    }
    
    if (!this.audioContext) {
      console.warn('Cannot play sound: AudioContext not available');
      return false;
    }
    
    if (!this.soundLoaded || !this.soundBuffer) {
      console.warn('Sound not loaded yet, trying to load now...');
      await this.loadSound();
      
      if (!this.soundBuffer) {
        console.error('Failed to load sound');
        return false;
      }
    }
    
    // Make sure audio context is running
    await this.resumeAudioContext();
    
    try {
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = this.soundBuffer;
      
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 1.0; // Full volume
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play the sound
      source.start(0);
      console.log('Notification sound played successfully');
      return true;
    } catch (error) {
      console.error('Error playing notification sound:', error);
      return false;
    }
  }

  // Enable or disable notification sounds
  public toggleSound(enabled?: boolean): boolean {
    if (typeof enabled === 'boolean') {
      this.soundEnabled = enabled;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    
    console.log(`Notification sounds ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    return this.soundEnabled;
  }

  // Check if sound is enabled
  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Check if sound system is ready
  public isReady(): boolean {
    return Boolean(this.audioContext && this.soundLoaded && this.soundBuffer);
  }

  // Force user interaction simulation (for testing)
  public simulateUserInteraction(): void {
    this.userInteracted = true;
    this.resumeAudioContext();
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();