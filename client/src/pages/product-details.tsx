import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import translations from "@/lib/i18n";
import { Product, categoryMap, statusMap } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProductDetailsPage = () => {
  // Get product ID from URL
  const [match, params] = useRoute("/products/:id");
  const id = params?.id;
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });
  
  // Status colors
  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800 border-green-200",
    limited: "bg-amber-100 text-amber-800 border-amber-200",
    soldout: "bg-red-100 text-red-800 border-red-200",
  };
  
  // If no product ID or error
  if (!id || (error && !isLoading)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>
              <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Sorry, we couldn't find the requested product.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/products">Return to Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product ? (
          <>
            <div className="mb-6">
              <Button variant="outline" asChild className="mb-8">
                <Link href="/products">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Return to Shopping
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div>
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-auto rounded-lg shadow-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
                  }}
                />
              </div>
              
              {/* Product Details */}
              <div>
                <h1 className="text-3xl font-bold font-primary mb-2">{product.title}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className={statusColors[product.status || 'available']}>
                    {statusMap[product.status || 'available']}
                  </Badge>
                  <Badge variant="outline">
                    {categoryMap[product.category || 'other']}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-6">{product.description}</p>
                
                <div className="text-2xl font-bold text-primary mb-6">
                  C${product.price}
                </div>
                
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full"
                    disabled={product.status === "soldout"}
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    Contact via WhatsApp to Order
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    asChild
                  >
                    <Link href="/contact">
                      Request More Information
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    About Amazon Return Pallets
                  </h3>
                  <p className="text-sm text-blue-700">
                    Amazon return pallets are products returned by buyers for various reasons, collected and sold at discounted prices. Product conditions vary and are described in the details of each pallet.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default ProductDetailsPage;
