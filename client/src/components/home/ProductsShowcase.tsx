import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product/ProductCard";

const ProductsShowcase = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Show only 4 products on homepage
  const showcaseProducts = products?.slice(0, 4);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark font-tajawal">
            {translations.shop.title}
          </h2>
          <p className="mt-4 text-neutral-medium max-w-2xl mx-auto">
            {translations.shop.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {showcaseProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white hover:bg-gray-100 text-primary font-bold shadow border border-gray-200"
          >
            <Link href="/products">
              {translations.shop.loadMore}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsShowcase;
