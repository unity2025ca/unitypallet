import { Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const Sidebar = () => {
  const [location] = useLocation();
  const { logout } = useAdminAuth();
  
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
  ];
  
  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="w-64 h-screen bg-sidebar text-sidebar-foreground fixed right-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-center mb-8">
          <span className="text-2xl font-bold text-sidebar-primary font-tajawal">
            Unity Admin
          </span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
            >
              <a className={`flex items-center px-4 py-3 rounded-md transition ${
                location === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              }`}>
                <i className={`${item.icon} w-5 ml-3`}></i>
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
          <i className="fas fa-sign-out-alt w-5 ml-3"></i>
          {translations.admin.sidebar.logout}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
