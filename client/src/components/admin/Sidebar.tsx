import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isMobileOpen?: boolean;
  toggleMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[]; // Roles that can access this item
}

interface NavCategory {
  name: string;
  items: NavItem[];
}

const Sidebar = ({ isMobileOpen, toggleMobile }: SidebarProps) => {
  const [location] = useLocation();
  const { logout, user } = useAdminAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Get current user role
  const userRole = user?.isAdmin ? 'admin' : (user?.roleType || 'user');
  
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
  
  // Define navigation items with categories and role-based access
  const navCategories: NavCategory[] = [
    {
      name: "Core",
      items: [
        { 
          name: translations.admin.sidebar.dashboard, 
          href: "/admin/dashboard", 
          icon: "fas fa-tachometer-alt",
          roles: ["admin", "publisher", "user"] // All roles can access
        },
        { 
          name: "Users", 
          href: "/admin/users", 
          icon: "fas fa-users",
          roles: ["admin"] // Only admin can access
        },
      ]
    },
    {
      name: "Content",
      items: [
        { 
          name: translations.admin.sidebar.products, 
          href: "/admin/products", 
          icon: "fas fa-box",
          roles: ["admin", "publisher"] // Admin and publisher can access
        },
        { 
          name: "FAQs", 
          href: "/admin/faqs", 
          icon: "fas fa-question-circle",
          roles: ["admin"] // Only admin can access 
        },
      ]
    },
    {
      name: "Customer",
      items: [
        { 
          name: translations.admin.sidebar.orders, 
          href: "/admin/orders", 
          icon: "fas fa-envelope",
          roles: ["admin", "publisher"] // Admin and publisher can access
        },
        { 
          name: "Appointments", 
          href: "/admin/appointments", 
          icon: "fas fa-calendar-alt",
          roles: ["admin", "publisher"] // Admin and publisher can access
        },
      ]
    },
    {
      name: "Marketing",
      items: [
        { 
          name: "Newsletter", 
          href: "/admin/newsletter", 
          icon: "fas fa-paper-plane",
          roles: ["admin"] // Only admin can access
        },
        { 
          name: "SMS Messages", 
          href: "/admin/sms", 
          icon: "fas fa-sms",
          roles: ["admin"] // Only admin can access
        },
      ]
    },
    {
      name: "Settings",
      items: [
        { 
          name: "Website Settings", 
          href: "/admin/settings", 
          icon: "fas fa-cog",
          roles: ["admin"] // Only admin can access
        },
      ]
    }
  ];
  
  // Flatten all items for active state checking
  const allNavItems = navCategories.flatMap(category => category.items);
  
  const handleLogout = () => {
    logout.mutate();
  };
  
  // For mobile, close sidebar when clicking a link
  const handleNavClick = () => {
    if (isMobile && toggleMobile) {
      toggleMobile();
    }
  };

  // Check active state
  const isActive = (href: string) => {
    return location === href;
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
            
            <nav className="space-y-6">
              {navCategories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category.name}
                  </h4>
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={handleNavClick}
                      >
                        <a className={`flex items-center px-4 py-2 text-sm rounded-md transition ${
                          location === item.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }`}>
                          <i className={`${item.icon} w-4 mr-3`}></i>
                          <span>{item.name}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          
          <div className="p-6 border-t border-sidebar-border mt-auto space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => window.location.href = '/'}
            >
              <i className="fas fa-home w-5 mr-3"></i>
              Return to Website
            </Button>
            
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
