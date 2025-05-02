import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { Product, ProductImage, categoryMap, statusMap } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, Check, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

const ProductDetailsPage = () => {
  // Get product ID from URL
  const [match, params] = useRoute("/products/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isMaintenanceMode } = useSettings();
  
  // State for selected image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // State for add to cart feedback
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest('POST', '/api/cart/items', { 
        productId,
        quantity: 1
      });
      return await res.json();
    },
    onSuccess: () => {
      // Show success feedback and reset after 2 seconds
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      
      // Invalidate cart cache
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Product added to cart!",
        description: "You can continue shopping or proceed to checkout.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  // Fetch product details
  const { data: product, isLoading: isLoadingProduct, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });
  
  // Fetch product images
  const { data: productImages, isLoading: isLoadingImages } = useQuery<ProductImage[]>({
    queryKey: [`/api/products/${id}/images`],
    enabled: !!id,
  });
  
  // Set the main image when product or productImages change
  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
    }
    
    if (productImages && productImages.length > 0) {
      // Find main image or use first image
      const mainImage = productImages.find(img => img.isMain);
      if (mainImage) {
        setSelectedImage(mainImage.imageUrl);
      } else if (productImages[0]) {
        setSelectedImage(productImages[0].imageUrl);
      }
    }
  }, [product, productImages]);
  
  // Status colors
  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800 border-green-200",
    limited: "bg-amber-100 text-amber-800 border-amber-200",
    soldout: "bg-red-100 text-red-800 border-red-200",
  };
  
  // Loading state if either product or images are loading
  const isLoading = isLoadingProduct || isLoadingImages;
  
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
              {/* Product Images Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedImage || product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-contain rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
                    }}
                  />
                </div>
                
                {/* Image Thumbnails */}
                {productImages && productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Default product image */}
                    <button
                      onClick={() => setSelectedImage(product.imageUrl)}
                      className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                        selectedImage === product.imageUrl ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={`${product.title} thumbnail`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=NA";
                        }}
                      />
                    </button>
                    
                    {/* Additional product images */}
                    {productImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.imageUrl)}
                        className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                          selectedImage === image.imageUrl ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={`${product.title} thumbnail ${image.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=NA";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
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
                    {isMaintenanceMode ? (
                    <>
                      <Alert className="border-amber-200 bg-amber-50 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <AlertTitle className="text-amber-800">Ordering Temporarily Unavailable</AlertTitle>
                        <AlertDescription className="text-amber-700">
                          Our website is currently undergoing maintenance. Purchasing features are temporarily unavailable.
                          Please contact us through WhatsApp for assistance.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex gap-4">
                        <Button 
                          size="lg" 
                          className="w-1/2 btn-red"
                          asChild
                        >
                          <a href="https://wa.me/12892166500" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-whatsapp mr-2"></i>
                            WhatsApp Order
                          </a>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-1/2 btn-black"
                          asChild
                        >
                          <Link href="/contact">
                            More Information
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        className="w-full text-xl py-6 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg"
                        disabled={product.status === "soldout" || addToCartMutation.isPending}
                        onClick={() => {
                          addToCartMutation.mutate(product.id);
                        }}
                      >
                        {product.status === "soldout" ? (
                          "Sold Out"
                        ) : addedToCart ? (
                          <div className="w-full" onClick={() => setLocation("/cart")}>
                            <Check className="mr-2 h-6 w-6 inline-block" />
                            View Cart & Checkout
                          </div>
                        ) : addToCartMutation.isPending ? (
                          <>
                            <div className="h-6 w-6 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="mr-2 h-6 w-6" />
                            ADD TO CART - C${product.price}
                          </>
                        )}
                      </Button>

                      <div className="flex gap-4">
                        <Button 
                          size="lg" 
                          className="w-1/2 btn-red"
                          disabled={product.status === "soldout"}
                          asChild
                        >
                          <a href="https://wa.me/12892166500" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-whatsapp mr-2"></i>
                            WhatsApp Order
                          </a>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-1/2 btn-black"
                          asChild
                        >
                          <Link href="/contact">
                            More Information
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
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
