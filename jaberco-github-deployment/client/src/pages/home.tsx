import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import ProductsShowcase from "@/components/home/ProductsShowcase";
import CTA from "@/components/home/CTA";

const HomePage = () => {
  return (
    <main>
      <Hero />
      <Features />
      <ProductsShowcase />
      <CTA />
    </main>
  );
};

export default HomePage;
