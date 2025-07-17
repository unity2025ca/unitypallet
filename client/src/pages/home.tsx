import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import ProductsShowcase from "@/components/home/ProductsShowcase";
import CTA from "@/components/home/CTA";
import AdvertisementBanner from "@/components/home/AdvertisementBanner";
import { SEOHead } from "@/components/seo/SEOHead";

const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Jaberco Liquidation",
    "url": "https://jaberco.com",
    "logo": "https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg",
    "description": "Leading Canadian liquidation company specializing in Amazon return pallets and bulk merchandise",
    "priceRange": "$50-$5000",
    "areaServed": "Canada",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CA"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Liquidation Products",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Amazon Return Pallets",
            "description": "High-quality Amazon return merchandise pallets"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Electronics Pallets",
            "description": "Consumer electronics liquidation pallets"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Clothing & Apparel Pallets",
            "description": "Fashion and clothing liquidation merchandise"
          }
        }
      ]
    }
  };

  return (
    <main>
      <SEOHead
        title="Jaberco® Liquidation - Amazon Return Pallets & Bulk Merchandise | Best Deals in Canada"
        description="Jaberco® Liquidation - Canada's premier destination for Amazon return pallets, bulk merchandise, and liquidation inventory. Discover unbeatable deals on electronics, clothing, home goods, and more with fast Canadian shipping."
        keywords="Amazon return pallets, liquidation pallets, bulk merchandise, wholesale pallets, Canadian liquidation, electronics pallets, clothing pallets, home goods pallets, wholesale inventory, bulk buying, liquidation sales, pallet auctions"
        url="https://jaberco.com"
        structuredData={structuredData}
      />
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
