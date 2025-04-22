import { Link } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary to-gray-500 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold font-primary mb-4 text-white">
              {translations.hero.title}
            </h1>
            <p className="text-xl mb-8 text-white font-medium">
              {translations.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="gray-button text-white font-bold"
              >
                <Link href="/products">
                  {translations.hero.browseButton}
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="gray-button text-white font-bold"
              >
                <Link href="/how-it-works">
                  {translations.hero.howItWorksButton}
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://e.top4top.io/p_33985nlw01.jpeg" 
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
