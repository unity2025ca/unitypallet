import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Very simple audio player component that can be used to play notification sounds
export function AudioPlayer() {
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  // Toggle sound enabled state
  const toggleSound = () => {
    setEnabled(prev => !prev);
    
    // Save preference to localStorage
    try {
      localStorage.setItem('notification-sound-enabled', (!enabled).toString());
    } catch (e) {
      // Ignore errors
    }
    
    // Show feedback toast
    toast({
      title: !enabled ? 'Sound Enabled' : 'Sound Disabled',
      description: !enabled ? 'You will hear notification sounds' : 'Notification sounds are muted',
      variant: 'default',
    });
  };
  
  // Initialize the global sound handler
  useEffect(() => {
    try {
      const savedSetting = localStorage.getItem('notification-sound-enabled');
      if (savedSetting !== null) {
        setEnabled(savedSetting === 'true');
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Register global function to play notification sound
    (window as any).playNotificationSound = () => {
      if (enabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error("Could not play notification sound:", error);
        });
      }
    };
    
    return () => {
      delete (window as any).playNotificationSound;
    };
  }, [enabled]);
  
  return (
    <div className="flex items-center">
      {/* Sound toggle button */}
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
      
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/notification-sound.wav" preload="auto" />
    </div>
  );
}