import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { 
  Trophy, 
  DollarSign, 
  Package, 
  FileText, 
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Truck
} from "lucide-react";

interface AuctionOrder {
  id: number;
  auctionId: number;
  userId: number;
  winningBid: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  invoiceStatus: 'pending' | 'generated' | 'sent';
  shippingStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  invoiceUrl?: string;
  trackingNumber?: string;
  createdAt: string;
  auction?: {
    title: string;
    endDate: string;
  };
  user?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export default function AdminAuctionOrders() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: auctionOrders = [], isLoading } = useQuery({
    queryKey: ['/api/admin/auction-orders'],
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/admin/auction-orders/${orderId}/payment`, {
        method: 'PATCH',
        body: { paymentStatus: status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
    }
  });

  const updateShippingMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: { 
      orderId: number; 
      status: string; 
      trackingNumber?: string;
    }) => {
      return apiRequest(`/api/admin/auction-orders/${orderId}/shipping`, {
        method: 'PATCH',
        body: { shippingStatus: status, trackingNumber }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest(`/api/admin/auction-orders/${orderId}/generate-invoice`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
    }
  });

  const getStatusColor = (status: string, type: 'payment' | 'shipping' | 'invoice') => {
    if (type === 'payment') {
      switch (status) {
        case 'paid': return 'bg-green-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-yellow-500';
      }
    }
    if (type === 'shipping') {
      switch (status) {
        case 'delivered': return 'bg-green-500';
        case 'shipped': return 'bg-blue-500';
        case 'processing': return 'bg-orange-500';
        default: return 'bg-gray-500';
      }
    }
    if (type === 'invoice') {
      switch (status) {
        case 'sent': return 'bg-green-500';
        case 'generated': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    }
    return 'bg-gray-500';
  };

  const filteredOrders = auctionOrders.filter((order: AuctionOrder) => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'pending-payment') return order.paymentStatus === 'pending';
    if (selectedStatus === 'paid') return order.paymentStatus === 'paid';
    if (selectedStatus === 'pending-shipping') return order.shippingStatus === 'pending' || order.shippingStatus === 'processing';
    if (selectedStatus === 'shipped') return order.shippingStatus === 'shipped' || order.shippingStatus === 'delivered';
    return true;
  });

  const stats = {
    total: auctionOrders.length,
    pendingPayment: auctionOrders.filter((o: AuctionOrder) => o.paymentStatus === 'pending').length,
    paid: auctionOrders.filter((o: AuctionOrder) => o.paymentStatus === 'paid').length,
    pendingShipping: auctionOrders.filter((o: AuctionOrder) => 
      o.shippingStatus === 'pending' || o.shippingStatus === 'processing'
    ).length,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auction Orders Management</h1>
          <p className="text-gray-600">Manage auction winner orders and shipping</p>
        </div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] })}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingPayment}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Orders</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Shipping</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingShipping}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending-payment">Pending Payment</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending-shipping">Pending Shipping</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No auction orders found</h3>
                  <p className="text-gray-500">Orders will appear here when customers win auctions</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order: AuctionOrder) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id} - {order.auction?.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Winner: {order.user?.fullName} ({order.user?.email})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(order.winningBid)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(order.paymentStatus, 'payment')}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        Payment: {order.paymentStatus}
                      </Badge>
                      <Badge className={getStatusColor(order.invoiceStatus, 'invoice')}>
                        <FileText className="h-3 w-3 mr-1" />
                        Invoice: {order.invoiceStatus}
                      </Badge>
                      <Badge className={getStatusColor(order.shippingStatus, 'shipping')}>
                        <Package className="h-3 w-3 mr-1" />
                        Shipping: {order.shippingStatus}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {order.paymentStatus === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updatePaymentMutation.mutate({ 
                            orderId: order.id, 
                            status: 'paid' 
                          })}
                          disabled={updatePaymentMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as Paid
                        </Button>
                      )}

                      {order.invoiceStatus === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateInvoiceMutation.mutate(order.id)}
                          disabled={generateInvoiceMutation.isPending}
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

                      {order.paymentStatus === 'paid' && 
                       (order.shippingStatus === 'pending' || order.shippingStatus === 'processing') && (
                        <Button
                          size="sm"
                          onClick={() => updateShippingMutation.mutate({ 
                            orderId: order.id, 
                            status: 'shipped',
                            trackingNumber: `TRK${order.id}${Date.now().toString().slice(-4)}`
                          })}
                          disabled={updateShippingMutation.isPending}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Mark as Shipped
                        </Button>
                      )}
                    </div>

                    {/* Customer Contact */}
                    <div className="pt-2 border-t">
                      <h4 className="font-semibold text-sm mb-2">Customer Contact:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {order.user?.email}</p>
                        {order.user?.phone && <p>Phone: {order.user?.phone}</p>}
                        {order.trackingNumber && (
                          <p>Tracking: <span className="font-mono">{order.trackingNumber}</span></p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}