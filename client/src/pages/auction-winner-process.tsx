import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trophy, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock,
  Download,
  Mail,
  Phone
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuctionWinner {
  auctionId: number;
  auctionTitle: string;
  winningBid: number;
  paymentStatus: "pending" | "paid" | "failed";
  invoiceStatus: "generated" | "sent" | "pending";
  shippingStatus: "pending" | "processing" | "shipped" | "delivered";
  winnerEmail: string;
  winDate: string;
  invoiceUrl?: string;
  trackingNumber?: string;
  productDetails: {
    title: string;
    description: string;
    imageUrl: string;
    category: string;
  };
}

export default function AuctionWinnerProcessPage() {
  const { data: winnerData, isLoading } = useQuery<AuctionWinner[]>({
    queryKey: ['/api/customer/auction-wins'],
  });

  const paymentMutation = useMutation({
    mutationFn: async (auctionId: number) => {
      const response = await apiRequest("POST", `/api/auctions/${auctionId}/payment`, {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    }
  });

  const downloadInvoiceMutation = useMutation({
    mutationFn: async (auctionId: number) => {
      const response = await fetch(`/api/auctions/${auctionId}/invoice`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auction-invoice-${auctionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });

  const getStatusBadge = (status: string, type: 'payment' | 'shipping' | 'invoice') => {
    const variants = {
      pending: 'outline',
      paid: 'default',
      failed: 'destructive',
      processing: 'outline',
      shipped: 'default',
      delivered: 'default',
      generated: 'default',
      sent: 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!winnerData || winnerData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Auction Wins</h2>
            <p className="text-gray-600">You haven't won any auctions yet. Keep bidding!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Auction Wins</h1>
        <p className="text-gray-600">Manage your auction wins, payments, and shipping</p>
      </div>

      <div className="space-y-6">
        {winnerData.map((win) => (
          <Card key={win.auctionId} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <div>
                    <CardTitle className="text-lg">{win.auctionTitle}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Won on {new Date(win.winDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(win.winningBid)}
                  </p>
                  <p className="text-sm text-gray-600">Winning Bid</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Product Details */}
              <div className="flex gap-4">
                <img
                  src={win.productDetails.imageUrl}
                  alt={win.productDetails.title}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/96x96?text=No+Image";
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{win.productDetails.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {win.productDetails.description}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {win.productDetails.category}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium mb-1">Payment</p>
                  {getStatusBadge(win.paymentStatus, 'payment')}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium mb-1">Invoice</p>
                  {getStatusBadge(win.invoiceStatus, 'invoice')}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium mb-1">Shipping</p>
                  {getStatusBadge(win.shippingStatus, 'shipping')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {win.paymentStatus === 'pending' && (
                  <Button
                    onClick={() => paymentMutation.mutate(win.auctionId)}
                    disabled={paymentMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}

                {win.invoiceStatus === 'generated' && (
                  <Button
                    variant="outline"
                    onClick={() => downloadInvoiceMutation.mutate(win.auctionId)}
                    disabled={downloadInvoiceMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}

                {win.trackingNumber && (
                  <Button variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Package: {win.trackingNumber}
                  </Button>
                )}

                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>

              {/* Progress Timeline */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Progress Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Won auction on {new Date(win.winDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {win.paymentStatus === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm">Payment {win.paymentStatus}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {win.shippingStatus === 'delivered' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : win.shippingStatus === 'pending' ? (
                      <Clock className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm">Shipping {win.shippingStatus}</span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              {win.paymentStatus === 'pending' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete payment within 3 days to secure your auction win. 
                    Failure to pay may result in forfeiture of the item.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}