import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple component to manage sound in the app
export default function NotificationSound() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element on component mount
  useEffect(() => {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 1.0;
    audioRef.current = audio;
    
    // Play a silent sound on first interaction to unlock audio
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log('Cannot autoplay audio, wait for user interaction', err);
        });
      }
      document.removeEventListener('click', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    
    return () => {
      document.removeEventListener('click', unlockAudio);
    };
  }, []);
  
  // Test play function
  const playSound = () => {
    if (!audioRef.current || !enabled) return;
    
    // Reset audio position to start
    audioRef.current.currentTime = 0;
    
    // Try to play
    audioRef.current.play().catch(error => {
      console.error('Error playing sound:', error);
      toast({
        title: 'Cannot Play Sound',
        description: 'Click on any page element first, then try again',
        variant: 'destructive',
      });
    });
  };
  
  // Toggle sound state
  const toggleSound = () => {
    const newState = !enabled;
    setEnabled(newState);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('notification-sound-enabled', newState ? 'true' : 'false');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Show feedback toast
    toast({
      title: newState ? 'Notifications Sound On' : 'Notifications Sound Off',
      description: newState 
        ? 'You will now hear sounds for new notifications' 
        : 'Notification sounds have been muted',
      variant: 'default',
    });
    
    // Play test sound if enabling
    if (newState) {
      playSound();
    }
  };
  
  // Expose play method to window for external calling
  useEffect(() => {
    // Add a global function to play notification sound
    (window as any).playNotificationSound = () => {
      if (enabled && audioRef.current) {
        playSound();
      }
    };
    
    // Load setting from localStorage
    try {
      const storedSetting = localStorage.getItem('notification-sound-enabled');
      if (storedSetting !== null) {
        setEnabled(storedSetting === 'true');
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    return () => {
      // Clean up global function
      delete (window as any).playNotificationSound;
    };
  }, [enabled]);
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSound}
      title={enabled ? 'Turn notification sound off' : 'Turn notification sound on'}
    >
      {enabled ? (
        <Volume2 className="h-5 w-5 text-green-500" />
      ) : (
        <VolumeX className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
}