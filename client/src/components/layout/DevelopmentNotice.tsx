import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';

export default function DevelopmentNotice() {
  const { getSettingValue } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Get development notice settings
  const isEnabled = getSettingValue('dev_notice_enabled') === 'true';
  const title = getSettingValue('dev_notice_title', 'Site Under Development');
  const message = getSettingValue('dev_notice_message', 'This website is currently under development and testing. We will be launching soon!');
  const buttonText = getSettingValue('dev_notice_button_text', 'I Understand');

  useEffect(() => {
    // Check if notice has been shown in this session
    const noticeShown = sessionStorage.getItem('dev_notice_shown');
    
    if (isEnabled && !noticeShown && !hasBeenShown) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasBeenShown(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isEnabled, hasBeenShown]);

  const handleClose = () => {
    setIsOpen(false);
    // Remember that notice was shown in this session
    sessionStorage.setItem('dev_notice_shown', 'true');
  };

  if (!isEnabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            onClick={handleClose}
            className="bg-red-600 hover:bg-red-700 text-white px-6"
          >
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}