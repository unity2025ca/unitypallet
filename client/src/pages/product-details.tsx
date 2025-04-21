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
  const statusColors = {
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
              <h1 className="text-2xl font-bold text-gray-900">المنتج غير موجود</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              عذراً، لم نتمكن من العثور على المنتج المطلوب.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/products">العودة إلى التسوق</Link>
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
                  <i className="fas fa-arrow-right ml-2"></i>
                  العودة إلى التسوق
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div>
                <img 
                  src={product.imageUrl} 
                  alt={product.titleAr}
                  className="w-full h-auto rounded-lg shadow-md object-cover"
                />
              </div>
              
              {/* Product Details */}
              <div>
                <h1 className="text-3xl font-bold font-tajawal mb-2">{product.titleAr}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className={statusColors[product.status]}>
                    {statusMap[product.status]}
                  </Badge>
                  <Badge variant="outline">
                    {categoryMap[product.category]}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-6">{product.descriptionAr}</p>
                
                <div className="text-2xl font-bold text-primary mb-6">
                  {product.price} ريال
                </div>
                
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full"
                    disabled={product.status === "soldout"}
                  >
                    <i className="fab fa-whatsapp ml-2"></i>
                    تواصل للطلب عبر واتساب
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    asChild
                  >
                    <Link href="/contact">
                      طلب المزيد من المعلومات
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    <i className="fas fa-info-circle ml-2"></i>
                    معلومات عن البالات
                  </h3>
                  <p className="text-sm text-blue-700">
                    بالات مرتجعات أمازون هي منتجات تم إرجاعها من قبل المشترين لأسباب مختلفة، ويتم تجميعها وبيعها بأسعار مخفضة. تختلف حالة المنتجات، ويتم توضيح ذلك في وصف كل بالة.
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
