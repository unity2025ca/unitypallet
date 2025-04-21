import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product/ProductCard";
import ProductFilter from "@/components/product/ProductFilter";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsPage = () => {
  const [location] = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Extract category from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [location]);
  
  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Filter products by category
  const filteredProducts = activeCategory === "all"
    ? products
    : products?.filter(product => product.category === activeCategory);
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    // Update URL with category parameter
    const url = category === "all" 
      ? "/products" 
      : `/products?category=${category}`;
    
    window.history.pushState({}, "", url);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark font-tajawal mb-4">
            {translations.shop.title}
          </h2>
          <p className="mt-4 text-neutral-medium max-w-2xl mx-auto">
            {translations.shop.subtitle}
          </p>
        </div>
        
        {/* Category Filter */}
        <ProductFilter 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        
        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-56" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">لا توجد منتجات في هذه الفئة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
