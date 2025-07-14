import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";
import { Package, Gavel, Sofa, Laptop, ArrowRight, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AuctionProduct {
  id: number;
  title: string;
  titleAr: string;
  condition: string;
  estimatedValue: number;
  imageUrl?: string;
}

interface Auction {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
  status: string;
  productImage?: string;
}

const ProductsShowcase = () => {
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: auctionProducts, isLoading: auctionProductsLoading } = useQuery<AuctionProduct[]>({
    queryKey: ["/api/auction-products"],
  });

  const { data: auctions, isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions"],
  });

  // Filter products by category
  const palletProducts = products?.filter(p => 
    p.category?.toLowerCase().includes('pallet') || 
    p.title.toLowerCase().includes('pallet') ||
    p.title.toLowerCase().includes('return')
  ).slice(0, 4);

  const electronicsProducts = products?.filter(p => 
    p.category?.toLowerCase().includes('electronics') || 
    p.category?.toLowerCase().includes('electronic') ||
    p.title.toLowerCase().includes('electronics')
  ).slice(0, 4);

  const furnitureProducts = products?.filter(p => 
    p.category?.toLowerCase().includes('furniture') || 
    p.category?.toLowerCase().includes('home') ||
    p.title.toLowerCase().includes('furniture')
  ).slice(0, 4);

  const activeAuctions = auctions?.filter(a => a.status === 'active').slice(0, 4);

  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(product.price)}
          </span>
          <Button 
            asChild 
            size="sm" 
            className="!bg-red-600 hover:!bg-red-700 !text-white"
          >
            <Link href={`/products/${product.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const AuctionCard = ({ auction }: { auction: Auction }) => {
    const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={auction.productImage || "/placeholder.jpg"}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="animate-pulse">Live</Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`} left
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{auction.title}</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Current Bid</p>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(auction.currentBid)}
              </span>
            </div>
            <Button 
              asChild 
              size="sm" 
              className="!bg-green-600 hover:!bg-green-700 !text-white"
            >
              <Link href={`/auctions/${auction.id}`}>
                Bid Now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategorySection = ({ 
    title, 
    description, 
    icon: Icon, 
    products, 
    isLoading, 
    viewAllLink,
    type = "product"
  }: { 
    title: string;
    description: string;
    icon: any;
    products: any[];
    isLoading: boolean;
    viewAllLink: string;
    type?: "product" | "auction";
  }) => (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Icon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        <Button 
          asChild 
          variant="outline" 
          className="hidden sm:flex items-center gap-2"
        >
          <Link href={viewAllLink}>
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
        ) : products?.length > 0 ? (
          products.map((item) => (
            type === "auction" ? 
              <AuctionCard key={item.id} auction={item} /> : 
              <ProductCard key={item.id} product={item} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No {title.toLowerCase()} available at the moment</p>
          </div>
        )}
      </div>
      
      <div className="text-center mt-6 sm:hidden">
        <Button 
          asChild 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Link href={viewAllLink}>
            View All {title} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Products & Auctions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing deals across our curated categories - from return pallets to live auctions
          </p>
        </div>

        {/* Amazon Return Pallets Section */}
        <CategorySection
          title="Amazon Return Pallets"
          description="High-value return pallets with mixed merchandise"
          icon={Package}
          products={palletProducts || []}
          isLoading={productsLoading}
          viewAllLink="/products?category=pallets"
        />

        {/* Live Auctions Section */}
        <CategorySection
          title="Live Auctions"
          description="Bid on exclusive items in real-time"
          icon={Gavel}
          products={activeAuctions || []}
          isLoading={auctionsLoading}
          viewAllLink="/auctions"
          type="auction"
        />

        {/* Electronics Section */}
        <CategorySection
          title="Electronics"
          description="Laptops, smartphones, tablets and more"
          icon={Laptop}
          products={electronicsProducts || []}
          isLoading={productsLoading}
          viewAllLink="/products?category=electronics"
        />

        {/* Furniture Section */}
        <CategorySection
          title="Home & Furniture"
          description="Quality furniture and home essentials"
          icon={Sofa}
          products={furnitureProducts || []}
          isLoading={productsLoading}
          viewAllLink="/products?category=furniture"
        />
      </div>
    </section>
  );
};

export default ProductsShowcase;
