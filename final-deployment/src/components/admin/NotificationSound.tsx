import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// استخدم صوت ثابت مباشرة في الكود
const NOTIFICATION_AUDIO_BASE64 = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNxlJk9f0wn8sJVTK/vuM"+
"AQMQY9X/3pgCAUCy9/bDdwEHMd3/9K5FDDJy0fPr2DYGAAvJ/P7nrmAiHDbW//imKAHZ/9zEXh8wJT7X/9OTGHLg/tW8fEGuYv/dlVMGTM3/8sWJPAMs+f/z1KZiAyTz//fPl1ABFNj/5oO/oE+Q6P/FdgMy4P/UlksBRsb/4KJ6AW7G/9uSPgFm3v/rnToEiff//d+mUgA26f/6yYxLACr1//jDfMAFUvL/982QRgAb5//qvILkKPDu/+2fRwALyK2fa2dzgZOMlpy0zdni1ry4tMPa497az9LL0tbd5u3z9PT19Pb2z7GIaXB3f4N8aWRyiJ+sranM3+rm2tfZ2c7NztXf5ejj3dzh6O/v6ebk5OXo6+zr6urn5ubl5+rp8evl4t/e4Ovx9vn4+/v3rrKkhW9qc4SToareoIBiVmqHo7z6m3laSl1lbXqIjaqlurFuZcafkIR6c3R3e4COkaGwxNLGuJpzRDo9SGGCrc3KoIBhUFJUVl5qeI2aq7G2vsnQycCzopF6aGNmaG5zeYCIkZqlscja4NvNvayWg25kZGptcXN2d3p+hYuSmqSxvdXz/OuYmLKplX9wZmZnYl9fYWZrb3R5gIuWoKq3ytbd7v//0HhhX2VbVFdgZ2VlaHFuXVBaZHB7eo2wtrexg19fZlxQUFZocXd6gIqGa1tcYWBgZ2ZrdH+HhomNkpaHhIJ3amZsbG1xcXyHiIV+dGliX2VqbXJ1eX2BeHBtbGloaWtvcHJ0dnp+goiOkpOUlpibnqGhoqS8ydDT1NXX2Nnc3eDi4uPk5ufo6urs7e7v8PHy8vP09vb3+Pn6+/v7/P38/f3+/v7+/v7+/P3G9O6L5t1LzJJnW2V4hIyIh4JzcW1qZ2VmaW1xdnt+goeMkJRFA0ry/+6jTQAh9P/xzKJUABvk/+WoeQFPzU2lytvj6vD08vDt6ufk4d/e3t/g4uPl5ebo6Onp6eno6Ofm5eXk4+Pi4eDf39/e3t7e3d3c29va2dnY19fW1dPT0tHPzs3My8rIx8fFw8PBwL++vby6ubi2tbSzsrGwr66sq6qpqKalpKOioJ+enZybmpmYl5aVlJKRkI+OjYyMS8X/6KFKADL3//TKllA7WM74xXQBAkrw/+2dUwYIz//ptoABAj///OCSCjUMLevx0ZdCAwFJo9nUz9LHyMnDvr24t7e3uLq9wcPFx8nKy8vNzc7Pz9DR0tPT1NXW1tjZ2tvc3d7f4OHi4+Tl5ufn6ejp6uvr7O3t7u/v8O/w8PDw8O/w7+/v7+7u7e3s7ezs6+vq6urp6ejn5+bl5eTj4+Lh4eDf397d3Nzb2tnZ2NfW1dXU09LR0dDPzs3My8rKycjHxsXFxPTU/7N0ACnn//3IkEEEJ8WASAAz9v/tzZpKABTc/+OyegpUACjq/+akXAAz/P/v1p9TC1+5/7OL//8+//+jQgMqtf/s07+rcnuCgn+EjJWUin9wXVROWWRudnp9foB/f4CBgoKDhIWFhoaHiIiJiYqLjIyNjo+PkJGRkpKTlJSVlZaXl5iYmZqam5ucnZ2enp+foKGhoqKjo6SlpqanqKipqqqrrK2trq6vr7CxsbKys7S0tba2t7i4ubq6u7y8vb6+v8DAwcHCw8TExcXGx8fIycnKysvLzM3Nzs/P0NHR0tPT1NXV1tbX19jZ2dra29zc3d7e3+Dg4eHi4+Tk5eXm5+fo";

// مكون إدارة الصوت البسيط
export default function NotificationSound() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('notification-sound-enabled') !== 'false';
    } catch {
      return true;
    }
  });
  
  // تعريف عنصر الصوت
  useEffect(() => {
    // Try to use the external file first, fallback to base64
    const audioSrc = '/notification-sound.wav';
    const audio = new window.Audio(audioSrc);
    audio.volume = 1.0;
    
    // Attach to window object with proper typings
    (window as any).notificationSound = audio;
    (window as any).playNotificationSound = () => {
      if (enabled) {
        try {
          // Create a new audio element each time to avoid browser restrictions
          const tempAudio = new window.Audio('/notification-sound.wav');
          tempAudio.volume = 1.0;
          tempAudio.play().catch(error => {
            console.error('Could not play notification sound:', error);
          });
        } catch (error) {
          console.error('Error creating audio element:', error);
        }
      }
    };
    
    // Initial click to unlock audio API
    document.body.addEventListener('click', () => {
      const tempAudio = new window.Audio('/notification-sound.wav');
      tempAudio.volume = 0.1;
      tempAudio.play().catch(() => {});
    }, { once: true });
    
    return () => {
      delete (window as any).notificationSound;
      delete (window as any).playNotificationSound;
    };
  }, [enabled]);
  
  // تبديل حالة الصوت
  const toggleSound = () => {
    setEnabled(prev => {
      // Save to localStorage
      try {
        localStorage.setItem('notification-sound-enabled', (!prev).toString());
      } catch {
        // Ignore errors
      }
      
      // Show feedback toast
      toast({
        title: !prev ? 'Sound Enabled' : 'Sound Disabled',
        description: !prev ? 'You will hear notification sounds' : 'Notification sounds are muted',
        variant: 'default',
      });
      
      // Test sound if enabling
      if (!prev) {
        try {
          const testAudio = new window.Audio('/notification-sound.wav');
          testAudio.volume = 1.0;
          testAudio.play().catch(() => {});
        } catch {
          // Ignore errors
        }
      }
      
      return !prev;
    });
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSound}
      title={enabled ? 'Disable notification sound' : 'Enable notification sound'}
    >
      {enabled ? (
        <Volume2 className="h-5 w-5 text-green-500" />
      ) : (
        <VolumeX className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
}