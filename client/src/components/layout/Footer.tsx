import { Link } from "wouter";
import translations from "@/lib/i18n";
import { useSettings } from "@/hooks/use-settings";

const Footer = () => {
  const { getSettingValue } = useSettings();
  
  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-primary">Unity</h3>
            <p className="text-gray-400 mb-4">{translations.footer.description}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-primary">{translations.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition">
                  {translations.navItems.home}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-primary transition">
                  {translations.navItems.shop}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition">
                  {translations.navItems.about}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-primary transition">
                  {translations.navItems.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-primary transition">
                  {translations.navItems.faq}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary transition">
                  {translations.navItems.contact}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-primary">{translations.footer.categories}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=electronics" className="text-gray-400 hover:text-primary transition">
                  {translations.shop.categories.electronics}
                </Link>
              </li>
              <li>
                <Link href="/products?category=home" className="text-gray-400 hover:text-primary transition">
                  {translations.shop.categories.home}
                </Link>
              </li>
              <li>
                <Link href="/products?category=toys" className="text-gray-400 hover:text-primary transition">
                  {translations.shop.categories.toys}
                </Link>
              </li>
              <li>
                <Link href="/products?category=mixed" className="text-gray-400 hover:text-primary transition">
                  {translations.shop.categories.mixed}
                </Link>
              </li>
              <li>
                <Link href="/products?category=other" className="text-gray-400 hover:text-primary transition">
                  {translations.shop.categories.other}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-primary">{translations.footer.contact}</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <i className="fas fa-map-marker-alt mt-1 text-gray-400"></i>
                <span className="text-gray-400">{translations.contact.info.address.value}</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-phone-alt mt-1 text-gray-400"></i>
                <span className="text-gray-400">{getSettingValue('contact_phone', translations.contact.info.phone.value)}</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-envelope mt-1 text-gray-400"></i>
                <span className="text-gray-400">{getSettingValue('contact_email', translations.contact.info.email.value)}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-6 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>{translations.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
