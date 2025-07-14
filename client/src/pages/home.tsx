import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import ProductsShowcase from "@/components/home/ProductsShowcase";
import CTA from "@/components/home/CTA";
import AdvertisementBanner from "@/components/home/AdvertisementBanner";

const HomePage = () => {
  return (
    <main>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdvertisementBanner position="homepage" />
      </div>
      <Features />
      <ProductsShowcase />
      <CTA />
    </main>
  );
};

export default HomePage;
