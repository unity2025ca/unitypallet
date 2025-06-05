import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

// A badge component that pulses to draw attention
export function NotificationBadge({
  count = 0,
  className,
  ...props
}: {
  count: number;
  className?: string;
  [key: string]: any;
}) {
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Start pulsing animation when the count increases
  useEffect(() => {
    if (count > 0) {
      setIsPulsing(true);
      // Stop pulsing after 10 seconds
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [count]);
  
  if (count === 0) return null;
  
  return (
    <Badge 
      className={cn(
        "flex items-center justify-center h-5 w-5 p-0",
        isPulsing ? "animate-pulse bg-red-500" : "bg-destructive", 
        className
      )}
      {...props}
    >
      {count}
    </Badge>
  );
}