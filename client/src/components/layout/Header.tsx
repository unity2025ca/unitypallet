import { useState } from "react";
import { Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { Menu } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { getSettingValue } = useSettings();

  const navItems = [
    { name: translations.navItems.home, href: "/" },
    { name: translations.navItems.shop, href: "/products" },
    { name: translations.navItems.about, href: "/about" },
    { name: translations.navItems.howItWorks, href: "/how-it-works" },
    { name: translations.navItems.faq, href: "/faq" },
    { name: translations.navItems.contact, href: "/contact" },
    { name: translations.navItems.admin, href: "/admin" },
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
                  alt={getSettingValue("site_name", "Unity")} 
                  className="h-10 mr-2" 
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {getSettingValue("site_name", "Unity")}
                </span>
              )}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
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
          </nav>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
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
                    ? "text-primary bg-blue-50" 
                    : "text-neutral-dark hover:bg-neutral-light"
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
