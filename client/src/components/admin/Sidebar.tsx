import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface SidebarProps {
  isMobileOpen?: boolean;
  toggleMobile?: () => void;
}

const Sidebar = ({ isMobileOpen, toggleMobile }: SidebarProps) => {
  const [location] = useLocation();
  const { logout } = useAdminAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  const navItems = [
    { 
      name: translations.admin.sidebar.dashboard, 
      href: "/admin/dashboard", 
      icon: "fas fa-tachometer-alt" 
    },
    { 
      name: translations.admin.sidebar.products, 
      href: "/admin/products", 
      icon: "fas fa-box" 
    },
    { 
      name: translations.admin.sidebar.orders, 
      href: "/admin/orders", 
      icon: "fas fa-envelope" 
    },
    { 
      name: "Newsletter", 
      href: "/admin/newsletter", 
      icon: "fas fa-paper-plane" 
    },
    { 
      name: "SMS Messages", 
      href: "/admin/sms", 
      icon: "fas fa-sms" 
    },
    { 
      name: "FAQs", 
      href: "/admin/faqs", 
      icon: "fas fa-question-circle" 
    },
    { 
      name: "Website Settings", 
      href: "/admin/settings", 
      icon: "fas fa-cog" 
    },
  ];
  
  const handleLogout = () => {
    logout.mutate();
  };
  
  // For mobile, close sidebar when clicking a link
  const handleNavClick = () => {
    if (isMobile && toggleMobile) {
      toggleMobile();
    }
  };

  // Desktop sidebar is always visible, mobile sidebar only when open
  const showSidebar = !isMobile || (isMobile && isMobileOpen);
  
  // Base sidebar classes
  const sidebarClasses = `
    bg-sidebar text-sidebar-foreground
    ${isMobile 
      ? 'fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out' 
      : 'w-64 h-screen fixed left-0 top-0'}
    ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
    overflow-y-auto
  `;

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}
    
      {/* Sidebar */}
      {showSidebar && (
        <div className={sidebarClasses}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold text-sidebar-primary">
                Unity Admin
              </span>
              
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobile}
                  className="text-sidebar-foreground"
                >
                  <X size={24} />
                </Button>
              )}
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={handleNavClick}
                >
                  <a className={`flex items-center px-4 py-3 rounded-md transition ${
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  }`}>
                    <i className={`${item.icon} w-5 mr-3`}></i>
                    <span>{item.name}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-6 border-t border-sidebar-border mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt w-5 mr-3"></i>
              {translations.admin.sidebar.logout}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
