import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Bell, Check, X, MessageSquare, Calendar, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User } from '@shared/schema';

// Import notification sound
const notificationSoundUrl = "/notification-sound.mp3";

// Notification type from API
interface Notification {
  id: number;
  userId: number;
  type: 'new_contact' | 'new_appointment' | 'status_update';
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  created_at: string;
}

// WebSocket connection setup helper
const createWebSocketConnection = (
  userId: number, 
  isAdmin: boolean, 
  isPublisher: boolean,
  onMessage: (data: any) => void
) => {
  // Create WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
  
  // Connection opened
  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
    // Authenticate the connection
    socket.send(JSON.stringify({
      type: 'auth',
      userId,
      isAdmin,
      isPublisher
    }));
  });
  
  // Listen for messages
  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  // Handle connection errors
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  // Handle connection close
  socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
  });
  
  return socket;
};

// Notification icon based on type
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_contact':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'new_appointment':
      return <Calendar className="h-4 w-4 text-green-500" />;
    case 'status_update':
      return <Info className="h-4 w-4 text-yellow-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

// Format date relative to now
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Convert to seconds, minutes, hours
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Notification center component
export function NotificationCenter({ 
  user 
}: { 
  user: User 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio element for notification sound
  useEffect(() => {
    const audio = new Audio(notificationSoundUrl);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.remove();
    };
  }, []);
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: getQueryFn({ url: '/api/notifications' }),
    refetchInterval: 60000, // Refetch every minute as a fallback
  });
  
  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/notifications/${id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });
  
  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/notifications/read-all');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'All notifications marked as read',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });
  
  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/notifications/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'new_contact') {
      setLocation('/admin/contacts');
    } else if (notification.type === 'new_appointment' || notification.type === 'status_update') {
      setLocation('/admin/appointments');
    }
    
    // Close the notification sheet
    setIsOpen(false);
  };
  
  // WebSocket connection and notification handling
  useEffect(() => {
    if (!user) return;
    
    const handleWebSocketMessage = (data: any) => {
      if (data.type === 'notification') {
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error('Error playing notification sound:', error);
          });
        }
        
        // Show toast notification
        toast({
          title: data.notification.title,
          description: data.notification.message,
          variant: 'default',
        });
        
        // Update notifications
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    };
    
    // Create WebSocket connection
    const socket = createWebSocketConnection(
      user.id,
      user.isAdmin === true,
      user.roleType === 'publisher',
      handleWebSocketMessage
    );
    
    // Cleanup on unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user, queryClient, toast]);
  
  return (
    <>
      <audio ref={audioRef} src={notificationSoundUrl} preload="auto" />
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              >
                Mark all as read
              </Button>
            )}
          </SheetHeader>
          
          <div className="mt-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive notifications for new messages and appointments
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-120px)]">
                <div className="space-y-4 pr-3">
                  {notifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-md cursor-pointer transition-colors",
                        !notification.isRead
                          ? "bg-accent/60 hover:bg-accent"
                          : "hover:bg-accent/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-sm font-medium",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}