import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { 
  Clock, 
  Gavel, 
  Eye, 
  Heart, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuctionDetails {
  id: number;
  productId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  startingPrice: number;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  status: "draft" | "active" | "ended" | "cancelled";
  winnerId: number | null;
  totalBids: number;
  isAutoExtend: boolean;
  autoExtendMinutes: number;
  createdAt: string;
  productTitle: string;
  productTitleAr: string;
  productDescription: string;
  productDescriptionAr: string;
  productPrice: number;
  productCategory: string;
  productStock: number;
  productImages: Array<{
    id: number;
    imageUrl: string;
    isMain: boolean;
  }>;
  recentBids: Array<{
    id: number;
    bidAmount: number;
    bidTime: string;
    isWinning: boolean;
    username: string;
    fullName: string;
  }>;
}

function formatTimeLeft(endTime: string) {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const timeLeft = end - now;

  if (timeLeft <= 0) {
    return { text: "Ended", isExpired: true };
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (days > 0) {
    return { text: `${days}d ${hours}h`, isExpired: false };
  } else if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, isExpired: false };
  } else if (minutes > 0) {
    return { text: `${minutes}m ${seconds}s`, isExpired: false };
  } else {
    return { text: `${seconds}s`, isExpired: false };
  }
}

export default function AuctionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<{text: string, isExpired: boolean}>({ text: "", isExpired: false });
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auction, isLoading } = useQuery<AuctionDetails>({
    queryKey: [`/api/auctions/${id}`],
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const placeBidMutation = useMutation({
    mutationFn: (bidAmount: number) => 
      apiRequest(`/api/auctions/${id}/bid`, "POST", { bidAmount }),
    onSuccess: () => {
      toast({
        title: "Bid placed successfully",
        description: "Your bid is under review",
      });
      setBidAmount("");
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Bidding error",
        description: error.message || "An error occurred while placing bid",
        variant: "destructive",
      });
    },
  });

  const watchMutation = useMutation({
    mutationFn: () => apiRequest(`/api/auctions/${id}/watch`, "POST"),
    onSuccess: (data: any) => {
      toast({
        title: data.watching ? "Added to watchlist" : "Removed from watchlist",
        description: data.message,
      });
    },
  });

  // Update countdown timer
  useEffect(() => {
    if (!auction) return;

    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  // Set initial image
  useEffect(() => {
    if (auction?.productImages?.length && !selectedImage) {
      const mainImage = auction.productImages.find(img => img.isMain) || auction.productImages[0];
      setSelectedImage(mainImage.imageUrl);
    }
  }, [auction, selectedImage]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Auction not found or has been deleted
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const minimumBid = Math.max(
    auction.currentBid + auction.bidIncrement,
    auction.startingPrice
  );

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount) * 100; // Convert to cents
    if (amount < minimumBid) {
      toast({
        title: "مبلغ المزايدة غير صحيح",
        description: `المبلغ الأدنى للمزايدة هو ${formatCurrency(minimumBid)}`,
        variant: "destructive",
      });
      return;
    }
    placeBidMutation.mutate(amount);
  };

  const isActive = auction.status === "active" && !timeLeft.isExpired;
  const isEnding = !timeLeft.isExpired && 
    new Date().getTime() > new Date(auction.endTime).getTime() - 60 * 60 * 1000;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={selectedImage || auction.productImages[0]?.imageUrl || "/placeholder.jpg"}
              alt={auction.titleAr || auction.title}
              className="w-full h-full object-cover"
            />
          </div>
          {auction.productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {auction.productImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image.imageUrl)}
                  className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
                    selectedImage === image.imageUrl 
                      ? "border-primary" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auction Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {auction.status === "active" ? "Active" : 
                 auction.status === "ended" ? "Ended" : 
                 auction.status === "draft" ? "Draft" : "Cancelled"}
              </Badge>
              {isEnding && isActive && (
                <Badge variant="destructive" className="animate-pulse">
                  Ending Soon
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {auction.title}
            </h1>
            <p className="text-muted-foreground">
              {auction.description}
            </p>
          </div>

          {/* Countdown Timer */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Time Remaining</span>
                </div>
                <div className={`text-2xl font-bold ${timeLeft.isExpired ? "text-red-500" : ""}`}>
                  {timeLeft.text}
                </div>
                {auction.isAutoExtend && isActive && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auction will be extended by {auction.autoExtendMinutes} minutes if bid placed in final minutes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Bid */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(auction.currentBid || auction.startingPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Gavel className="w-5 h-5" />
                    {auction.totalBids}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidding Section */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Place Your Bid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Minimum bid: {formatCurrency(minimumBid)}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minimumBid / 100}
                      step="0.01"
                    />
                    <Button
                      onClick={handlePlaceBid}
                      disabled={placeBidMutation.isPending || !bidAmount}
                      className="min-w-[100px] !bg-red-600 !text-white !opacity-100 hover:!bg-red-600 focus:!bg-red-600 active:!bg-red-600 disabled:!bg-gray-400 disabled:!text-gray-200"
                    >
                      {placeBidMutation.isPending ? "Placing..." : "Place Bid"}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount((minimumBid / 100).toFixed(2))}
                    className="!bg-red-600 !text-white !opacity-100 !border-red-600 hover:!bg-red-600 focus:!bg-red-600 active:!bg-red-600"
                  >
                    {formatCurrency(minimumBid)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount(((minimumBid + auction.bidIncrement) / 100).toFixed(2))}
                    className="!bg-red-600 !text-white !opacity-100 !border-red-600 hover:!bg-red-600 focus:!bg-red-600 active:!bg-red-600"
                  >
                    {formatCurrency(minimumBid + auction.bidIncrement)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount(((minimumBid + auction.bidIncrement * 2) / 100).toFixed(2))}
                    className="!bg-red-600 !text-white !opacity-100 !border-red-600 hover:!bg-red-600 focus:!bg-red-600 active:!bg-red-600"
                  >
                    {formatCurrency(minimumBid + auction.bidIncrement * 2)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Watch Button */}
          <Button
            variant="outline"
            onClick={() => watchMutation.mutate()}
            disabled={watchMutation.isPending}
            className="w-full !bg-red-600 !text-white !opacity-100 !border-red-600 hover:!bg-red-600 focus:!bg-red-600 active:!bg-red-600 disabled:!bg-gray-400 disabled:!text-gray-200"
          >
            <Heart className="w-4 h-4 mr-2" />
            {watchMutation.isPending ? "Loading..." : "Add to Watchlist"}
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="bids" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bids">Bidding History</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Delivery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Bidding History ({auction.totalBids})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auction.recentBids.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No bids yet. Be the first to bid!
                </p>
              ) : (
                <div className="space-y-3">
                  {auction.recentBids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        bid.isWinning ? "bg-green-50 border-green-200" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <AvatarInitials name={bid.fullName || bid.username} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {bid.fullName || bid.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bid.bidTime).toLocaleString("ar-EG")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">
                          {formatCurrency(bid.bidAmount)}
                        </span>
                        {bid.isWinning && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{auction.productCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Quantity</p>
                  <p className="font-medium">{auction.productStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Original Price</p>
                  <p className="font-medium">{formatCurrency(auction.productPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Starting Price</p>
                  <p className="font-medium">{formatCurrency(auction.startingPrice)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">
                  {auction.productDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Shipping cost will be calculated based on your location and product weight
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Shipping within Toronto</span>
                  <span className="font-medium">$15 - $25</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping within Ontario</span>
                  <span className="font-medium">$20 - $35</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping within Canada</span>
                  <span className="font-medium">$25 - $50</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                * Prices are estimates and may vary based on weight, size, and exact location
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}