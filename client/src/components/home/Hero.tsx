import { Link } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

const Hero = () => {
  const { getSettingValue } = useSettings();
  
  // Get banner content from settings
  const bannerTitle = getSettingValue('home_banner_title', translations.hero.title);
  const bannerSubtitle = getSettingValue('home_banner_subtitle', translations.hero.subtitle);
  const bannerButtonText = getSettingValue('home_banner_button_text', translations.hero.browseButton);
  const bannerButtonLink = getSettingValue('home_banner_button_link', '/products');
  
  // Get banner image from settings
  const bannerImage = getSettingValue('home_banner_image', '');
  
  // Background style with dynamic image if available
  const sectionStyle = bannerImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bannerImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};
  
  return (
    <section 
      className="relative bg-black overflow-hidden" 
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold font-primary mb-4 text-white">
              {bannerTitle}
            </h1>
            <p className="text-xl mb-8 text-gray-300 font-medium">
              {bannerSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="btn-red font-bold"
              >
                <Link href={bannerButtonLink}>
                  {bannerButtonText}
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="btn-white font-bold"
              >
                <Link href="/how-it-works">
                  {translations.hero.howItWorksButton}
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src={bannerImage || "https://e.top4top.io/p_33985nlw01.jpeg"} 
              alt="Amazon Return Pallets" 
              className="rounded-lg shadow-2xl object-cover h-80 md:h-96 w-full" 
            />
          </div>
        </div>
      </div>
      
      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          viewBox="0 0 2880 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="h-[70px] w-full"
        >
          <path d="M0 48h2880V0h-720C1442.5 52 720 0 720 0H0v48z" fill="#ffffff"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
