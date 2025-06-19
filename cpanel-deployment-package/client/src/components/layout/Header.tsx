import { useState } from "react";
import { Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { 
  Menu, 
  User, 
  ShoppingBag, 
  LogOut,
  LogIn
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { getSettingValue } = useSettings();
  const { customer, logoutMutation } = useCustomerAuth();

  const navItems = [
    { name: translations.navItems.home, href: "/" },
    { name: translations.navItems.shop, href: "/products" },
    { name: translations.navItems.about, href: "/about" },
    { name: translations.navItems.howItWorks, href: "/how-it-works" },
    { name: translations.navItems.faq, href: "/faq" },
    { name: translations.navItems.contact, href: "/contact" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              {getSettingValue("site_logo") ? (
                <img 
                  src={getSettingValue("site_logo")} 
                  alt={getSettingValue("site_name", "Jaberco")} 
                  className="h-10 mr-2" 
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {getSettingValue("site_name", "Jaberco")}
                </span>
              )}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`font-medium transition ${
                  location === item.href ? "text-primary" : "text-neutral-dark hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Customer Account */}
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative" size="sm">
                    <User className="h-5 w-5 mr-1" />
                    <span className="max-w-[100px] truncate">{customer.fullName || customer.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/account")}>
                    <User className="h-4 w-4 mr-2" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/orders")}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      logoutMutation.mutate();
                      setLocation("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setLocation("/auth")}
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/account")}>
                    <User className="h-4 w-4 mr-2" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/orders")}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      logoutMutation.mutate();
                      setLocation("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/auth")}
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span>Login</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md ${
                  location === item.href 
                    ? "text-primary bg-red-50" 
                    : "text-neutral-dark hover:bg-neutral-light hover:text-primary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;