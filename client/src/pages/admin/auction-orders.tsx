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

  const updateSecurityDepositMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/admin/auction-orders/${orderId}/security-deposit`, {
        method: 'PATCH',
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-orders'] });
    }
  });

  const updateCashPaymentMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/admin/auction-orders/${orderId}/cash-payment`, {
        method: 'PATCH',
        body: { status }
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

  const getStatusColor = (status: string, type: 'payment' | 'shipping' | 'invoice' | 'deposit' | 'cash') => {
    if (type === 'payment') {
      switch (status) {
        case 'fully_paid': return 'bg-green-500';
        case 'deposit_paid': return 'bg-blue-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-yellow-500';
      }
    }
    if (type === 'deposit') {
      switch (status) {
        case 'paid': return 'bg-green-500';
        case 'failed': return 'bg-red-500';
        default: return 'bg-yellow-500';
      }
    }
    if (type === 'cash') {
      switch (status) {
        case 'paid': return 'bg-green-500';
        default: return 'bg-orange-500';
      }
    }
    if (type === 'shipping') {
      switch (status) {
        case 'delivered': return 'bg-green-500';
        case 'ready_for_pickup': return 'bg-blue-500';
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
    if (selectedStatus === 'pending-deposit') return order.securityDepositStatus === 'pending';
    if (selectedStatus === 'deposit-paid') return order.securityDepositStatus === 'paid' && order.cashPaymentStatus === 'pending';
    if (selectedStatus === 'fully-paid') return order.cashPaymentStatus === 'paid';
    if (selectedStatus === 'ready-pickup') return order.shippingStatus === 'ready_for_pickup';
    return true;
  });

  const stats = {
    total: auctionOrders.length,
    pendingDeposit: auctionOrders.filter((o: AuctionOrder) => o.securityDepositStatus === 'pending').length,
    depositPaid: auctionOrders.filter((o: AuctionOrder) => o.securityDepositStatus === 'paid' && o.cashPaymentStatus === 'pending').length,
    fullyPaid: auctionOrders.filter((o: AuctionOrder) => o.cashPaymentStatus === 'paid').length,
    readyForPickup: auctionOrders.filter((o: AuctionOrder) => o.shippingStatus === 'ready_for_pickup').length,
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
                <p className="text-sm text-gray-600">Pending Deposit (15%)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingDeposit}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deposit Paid</p>
                <p className="text-2xl font-bold text-blue-600">{stats.depositPaid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready for Pickup</p>
                <p className="text-2xl font-bold text-green-600">{stats.readyForPickup}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending-deposit">Pending Deposit</TabsTrigger>
          <TabsTrigger value="deposit-paid">Deposit Paid</TabsTrigger>
          <TabsTrigger value="fully-paid">Fully Paid</TabsTrigger>
          <TabsTrigger value="ready-pickup">Ready Pickup</TabsTrigger>
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
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Deposit (15%): <span className="font-semibold">{formatCurrency(order.securityDepositAmount || Math.round(order.winningBid * 0.15))}</span></p>
                          <p>Cash at Pickup: <span className="font-semibold">{formatCurrency(order.remainingAmount || (order.winningBid - Math.round(order.winningBid * 0.15)))}</span></p>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(order.securityDepositStatus || 'pending', 'deposit')}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        Deposit: {order.securityDepositStatus || 'pending'}
                      </Badge>
                      <Badge className={getStatusColor(order.cashPaymentStatus || 'pending', 'cash')}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        Cash: {order.cashPaymentStatus || 'pending'}
                      </Badge>
                      <Badge className={getStatusColor(order.invoiceStatus, 'invoice')}>
                        <FileText className="h-3 w-3 mr-1" />
                        Invoice: {order.invoiceStatus}
                      </Badge>
                      <Badge className={getStatusColor(order.shippingStatus, 'shipping')}>
                        <Package className="h-3 w-3 mr-1" />
                        Status: {order.shippingStatus}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {(order.securityDepositStatus === 'pending' || !order.securityDepositStatus) && (
                        <Button
                          size="sm"
                          style={{ backgroundColor: '#dc2626', color: 'white' }}
                          onClick={() => updateSecurityDepositMutation.mutate({ 
                            orderId: order.id, 
                            status: 'paid' 
                          })}
                          disabled={updateSecurityDepositMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Deposit Paid
                        </Button>
                      )}

                      {order.securityDepositStatus === 'paid' && order.cashPaymentStatus === 'pending' && (
                        <Button
                          size="sm"
                          style={{ backgroundColor: '#dc2626', color: 'white' }}
                          onClick={() => updateCashPaymentMutation.mutate({ 
                            orderId: order.id, 
                            status: 'paid' 
                          })}
                          disabled={updateCashPaymentMutation.isPending}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Cash Received
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