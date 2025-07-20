import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid, List, Clock, Gavel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/product/ProductCard";
import { categoryMap } from "@shared/schema";
import { Link } from "wouter";

interface Product {
  id: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  status: string;
  price: number;
  imageUrl: string;
  productType: string;
  displayOrder: number;
  createdAt: string;
}

interface Auction {
  id: number;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  currentBid: number;
  totalBids: number;
}

export default function AuctionProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: auctions = [], isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ['/api/auctions'],
  });

  // Filter for auction products only
  const auctionProducts = products.filter(product => 
    product.productType === 'auction'
  );

  // Filter products based on search and category
  const filteredProducts = auctionProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.titleAr.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLoading = productsLoading || auctionsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Gavel className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">Auction Products</h1>
        </div>
        <p className="text-gray-600">Bid on exclusive auction products and win amazing deals</p>
        
        {/* Quick Access to Live Auctions */}
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                {auctions.filter(a => a.status === 'active').length} Live Auctions Available
              </span>
            </div>
            <Link href="/auctions">
              <Button className="bg-red-600 hover:bg-red-700">
                View Live Auctions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search auction products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryMap).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="bg-red-600 hover:bg-red-700"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="bg-red-600 hover:bg-red-700"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {auctionProducts.length} auction products
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Gavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No auction products found matching your criteria.</p>
          <p className="text-gray-400">Check back later for new auction opportunities!</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              isAuction={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}