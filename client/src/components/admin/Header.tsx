import { Menu, BellRing } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NotificationCenter } from './NotificationCenter';
import { useAdminAuth } from '@/hooks/use-admin-auth';

interface HeaderProps {
  title: string;
  toggleMobileMenu: () => void;
}

export function Header({ title, toggleMobileMenu }: HeaderProps) {
  const { user } = useAdminAuth();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="mr-2 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notification Center */}
        {user && <NotificationCenter user={user} />}
      </div>
    </div>
  );
}