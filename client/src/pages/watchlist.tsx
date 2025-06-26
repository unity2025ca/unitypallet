import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, TrendingUp, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

interface WatchlistAuction {
  id: number;
  title: string;
  currentBid: number;
  startingPrice: number;
  endTime: string;
  status: string;
  productImage: string;
  totalBids: number;
  isWatching: boolean;
}

export default function WatchlistPage() {
  const { data: watchlist, isLoading, error } = useQuery<WatchlistAuction[]>({
    queryKey: ["/api/auctions/watchlist"],
    staleTime: 5000,
    refetchInterval: 5000, // Refresh every 5 seconds to get live prices
  });

  console.log('Watchlist data:', watchlist);
  console.log('Watchlist error:', error);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-red-600" />
          <h1 className="text-3xl font-bold">My Watchlist</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Mock data for demonstration since we don't have a real watchlist API yet
  const mockWatchlist: WatchlistAuction[] = [
    {
      id: 1,
      title: "Amazon Return Pallet - Electronics Mix",
      currentBid: 125000,
      startingPrice: 100000,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: "active",
      productImage: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
      totalBids: 15,
      isWatching: true
    },
    {
      id: 2,
      title: "Brand New Clothing Lot - Designer Items",
      currentBid: 85000,
      startingPrice: 75000,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
      status: "active",
      productImage: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
      totalBids: 8,
      isWatching: true
    }
  ];

  // Use real data from API, fallback to empty array if no data
  const displayWatchlist = watchlist && watchlist.length > 0 ? watchlist : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-600" />
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        <Badge variant="secondary" className="ml-2">
          {displayWatchlist.length} items
        </Badge>
      </div>

      {displayWatchlist.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
            <p className="text-gray-600 mb-4">
              Start watching auctions to keep track of items you're interested in.
            </p>
            <Link href="/auctions">
              <Button className="!bg-red-600 !text-white hover:!bg-red-700">
                Browse Auctions
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayWatchlist.map((auction) => (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={auction.productImage}
                    alt={auction.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 right-2 ${
                      auction.status === 'active' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {auction.status === 'active' ? 'Live' : 'Ended'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {auction.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(auction.currentBid)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Starting Price:</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(auction.startingPrice)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time Left:
                    </span>
                    <span className={`text-sm font-medium ${
                      formatTimeLeft(auction.endTime) === 'Ended' 
                        ? 'text-red-600' 
                        : 'text-orange-600'
                    }`}>
                      {formatTimeLeft(auction.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Total Bids:
                    </span>
                    <span className="text-sm font-medium">
                      {auction.totalBids}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/auctions/${auction.id}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Auction
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    title="Remove from watchlist"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Watching {displayWatchlist.length} auction{displayWatchlist.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}