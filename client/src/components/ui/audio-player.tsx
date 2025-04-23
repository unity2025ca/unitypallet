import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Very simple audio player component that can be used to play notification sounds
export function AudioPlayer() {
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  // Try to play audio when clicked
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          toast({
            title: "Sound Test Successful",
            description: "You will hear notification sounds",
            variant: "default",
          });
        })
        .catch(error => {
          console.error("Could not play audio:", error);
          toast({
            title: "Sound Test Failed",
            description: "Browser blocked autoplay, click on Test Sound button",
            variant: "destructive",
          });
        });
    }
  };
  
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
    <div className="flex items-center gap-2">
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
      
      {/* Test sound button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlay}
        title="Test notification sound"
        className="px-2"
      >
        <Play className="h-4 w-4 mr-1" /> Test Sound
      </Button>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/notification-sound.wav" preload="auto" />
    </div>
  );
}