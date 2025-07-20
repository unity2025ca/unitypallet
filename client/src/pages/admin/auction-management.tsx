import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Edit, Trash2, Eye, Download, Truck, DollarSign, Package,
  Timer, Users, TrendingUp, CheckCircle, AlertCircle, Clock,
  FileText, CreditCard, MapPin, Camera, Upload, Settings
} from "lucide-react";

// Types
interface Auction {
  id: number;
  title: string;
  description: string;
  startingBid: number;
  currentBid: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  totalBids: number;
  watchers: number;
  images: string[];
  category: string;
  condition: string;
  auctionProductId?: number;
}

interface AuctionProduct {
  id: number;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  categoryAr: string;
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  estimatedValue?: number;
  weight?: number;
  dimensions?: string;
  location?: string;
  mainImage?: string;
  images: Array<{
    id: number;
    imageUrl: string;
    isMain: boolean;
    altText?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AuctionOrder {
  id: number;
  auctionId: number;
  userId: number;
  winningBid: number;
  paymentStatus: 'deposit_pending' | 'deposit_paid' | 'fully_paid' | 'failed';
  invoiceStatus: 'pending' | 'generated' | 'sent';
  shippingStatus: 'pending' | 'processing' | 'ready_for_pickup' | 'delivered';
  securityDepositAmount: number;
  remainingAmount: number;
  securityDepositStatus: 'pending' | 'paid' | 'failed';
  cashPaymentStatus: 'pending' | 'paid';
  invoiceUrl?: string;
  trackingNumber?: string;
  createdAt: string;
  auction?: {
    title: string;
    endTime: string;
  };
  user?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

const formatCurrency = (amount?: number) => {
  if (!amount) return "$0.00";
  return `$${(amount / 100).toFixed(2)}`;
};

const conditionOptions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export default function AuctionManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAuction, setSelectedAuction] = useState<Auction | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<AuctionProduct | null>(null);
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data for all sections
  const { data: auctions = [], isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions", { status: "all" }],
  });

  const { data: auctionProducts = [], isLoading: productsLoading } = useQuery<AuctionProduct[]>({
    queryKey: ["/api/auction-products"],
  });

  const { data: auctionOrders = [], isLoading: ordersLoading } = useQuery<AuctionOrder[]>({
    queryKey: ['/api/admin/auction-orders'],
  });

  const { data: auctionStats } = useQuery({
    queryKey: ['/api/admin/auction-stats'],
  });

  // Mutations for auction orders
  const updateSecurityDepositMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/admin/auction-orders/${orderId}/security-deposit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update security deposit');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
      toast({ title: "Success", description: "Security deposit status updated" });
    }
  });

  const updateCashPaymentMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/admin/auction-orders/${orderId}/cash-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update cash payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
      toast({ title: "Success", description: "Cash payment status updated" });
    }
  });

  const markDeliveredMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/admin/auction-orders/${orderId}/mark-delivered`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark as delivered');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
      toast({ title: "Success", description: "Order marked as delivered with notifications sent" });
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/admin/auction-orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to generate invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
      toast({ title: "Success", description: "Invoice generated successfully" });
    }
  });

  // Delete mutations
  const deleteAuctionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/auctions/${id}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Success", description: "Auction deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/auction-products/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Success", description: "Auction product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/auction-products"] });
    },
  });

  // Status badge helpers
  const getStatusColor = (status: string, type: 'payment' | 'shipping' | 'invoice' | 'deposit' | 'cash') => {
    if (type === 'payment') {
      switch (status) {
        case 'fully_paid': return 'bg-green-500';
        case 'deposit_paid': return 'bg-blue-500';
        case 'deposit_pending': return 'bg-yellow-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    }
    if (type === 'shipping') {
      switch (status) {
        case 'delivered': return 'bg-green-500';
        case 'ready_for_pickup': return 'bg-blue-500';
        case 'processing': return 'bg-yellow-500';
        case 'pending': return 'bg-gray-500';
        default: return 'bg-gray-500';
      }
    }
    if (type === 'deposit' || type === 'cash') {
      switch (status) {
        case 'paid': return 'bg-green-500';
        case 'pending': return 'bg-yellow-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    }
    return 'bg-gray-500';
  };

  const getAuctionStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      active: "default", 
      ended: "outline",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition) {
      case "new": return "default";
      case "like_new": return "secondary";
      case "good": return "outline";
      case "fair": return "destructive";
      case "poor": return "destructive";
      default: return "outline";
    }
  };

  if (auctionsLoading || productsLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Auction Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setSelectedAuction(undefined);
              setIsAuctionDialogOpen(true);
            }}
            style={{ backgroundColor: '#dc2626', color: 'white' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Auction
          </Button>
          <Button 
            onClick={() => {
              setSelectedProduct(null);
              setIsProductDialogOpen(true);
            }}
            variant="outline"
          >
            <Package className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Auctions</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(auctionStats as any)?.totalAuctions || auctions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {(auctionStats as any)?.activeAuctions || auctions.filter(a => a.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auction Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auctionProducts.length}</div>
                <p className="text-xs text-muted-foreground">Available for auctions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auctionOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  {auctionOrders.filter(o => o.shippingStatus === 'delivered').length} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(auctionOrders.reduce((sum, order) => sum + order.winningBid, 0))}
                </div>
                <p className="text-xs text-muted-foreground">Total auction revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest auction orders and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auctionOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Order #{order.id} - {order.auction?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(order.winningBid)} by {order.user?.fullName}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.paymentStatus, 'payment')} text-white`}>
                      {order.paymentStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auctions Tab */}
        <TabsContent value="auctions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Auctions</CardTitle>
              <CardDescription>Create, edit, and manage auction listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Bids</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium">{auction.title}</TableCell>
                      <TableCell>{formatCurrency(auction.currentBid)}</TableCell>
                      <TableCell>{getAuctionStatusBadge(auction.status)}</TableCell>
                      <TableCell>{new Date(auction.endTime).toLocaleDateString()}</TableCell>
                      <TableCell>{auction.totalBids}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteAuctionMutation.mutate(auction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auction Products</CardTitle>
              <CardDescription>Manage products available for auction</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctionProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge variant={getConditionBadgeVariant(product.condition)}>
                          {product.condition.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.estimatedValue)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auction Orders Management</CardTitle>
              <CardDescription>Manage auction winner payments, invoices, and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Auction</TableHead>
                    <TableHead>Winning Bid</TableHead>
                    <TableHead>Security Deposit</TableHead>
                    <TableHead>Cash Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctionOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.user?.fullName}</TableCell>
                      <TableCell>{order.auction?.title}</TableCell>
                      <TableCell>{formatCurrency(order.winningBid)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.securityDepositStatus, 'deposit')} text-white`}>
                          {order.securityDepositStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.cashPaymentStatus, 'cash')} text-white`}>
                          {order.cashPaymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.shippingStatus, 'shipping')} text-white`}>
                          {order.shippingStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {order.securityDepositStatus === 'pending' && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#dc2626', color: 'white' }}
                              onClick={() => updateSecurityDepositMutation.mutate({ orderId: order.id, status: 'paid' })}
                            >
                              Mark Deposit Paid
                            </Button>
                          )}
                          
                          {order.securityDepositStatus === 'paid' && order.cashPaymentStatus === 'pending' && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#dc2626', color: 'white' }}
                              onClick={() => updateCashPaymentMutation.mutate({ orderId: order.id, status: 'paid' })}
                            >
                              Cash Received
                            </Button>
                          )}
                          
                          {!order.invoiceUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateInvoiceMutation.mutate(order.id)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Generate Invoice
                            </Button>
                          )}
                          
                          {order.invoiceUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(order.invoiceUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download Invoice
                            </Button>
                          )}
                          
                          {order.cashPaymentStatus === 'paid' && order.shippingStatus === 'ready_for_pickup' && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#dc2626', color: 'white' }}
                              onClick={() => markDeliveredMutation.mutate(order.id)}
                              disabled={markDeliveredMutation.isPending}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              {markDeliveredMutation.isPending ? 'Processing...' : 'Mark Delivered'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['deposit_pending', 'deposit_paid', 'fully_paid', 'failed'].map((status) => {
                    const count = auctionOrders.filter(o => o.paymentStatus === status).length;
                    const percentage = auctionOrders.length ? Math.round((count / auctionOrders.length) * 100) : 0;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['pending', 'processing', 'ready_for_pickup', 'delivered'].map((status) => {
                    const count = auctionOrders.filter(o => o.shippingStatus === status).length;
                    const percentage = auctionOrders.length ? Math.round((count / auctionOrders.length) * 100) : 0;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}