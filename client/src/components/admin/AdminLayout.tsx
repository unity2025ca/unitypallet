import { ReactNode, useState } from "react";
import { Redirect } from "wouter";
import { Loader2, Menu } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  requireAdmin?: boolean;
}

export function AdminLayout({ children, title, requireAdmin = false }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }
  
  // Check if admin role is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Redirect to="/admin/dashboard" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Mobile overlay when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-auto transition-all duration-300">
        {/* Header with mobile menu and notifications */}
        <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-slate-50 py-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="mr-2 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notification Center - always visible */}
            {user && <NotificationCenter user={user} />}
          </div>
        </div>
        
        {/* Main content */}
        <div className="pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}

