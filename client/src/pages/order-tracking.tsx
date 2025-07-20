import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Clock, CheckCircle, XCircle, Truck, CreditCard, Gavel, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: number;
  orderType: string;
  auctionId?: number;
  status: string;
  paymentStatus: string;
  total: number;
  shippingCost: number;
  shippingAddress: string;
  shippingCity: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  auction?: {
    id: number;
    title: string;
    winningBid: number;
  };
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  pricePerUnit: number;
  product: {
    id: number;
    title: string;
    imageUrl: string;
    productType: string;
  };
}

export default function OrderTrackingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Filter orders based on search and type
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => 
                           item.product.title.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesType = selectedOrderType === "all" || order.orderType === selectedOrderType;
    
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === 'auction' ? 
      <Gavel className="h-4 w-4 text-red-600" /> : 
      <ShoppingBag className="h-4 w-4 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
        <p className="text-gray-600">Track your retail purchases and auction wins</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by order ID, address, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedOrderType === "all" ? "default" : "outline"}
            onClick={() => setSelectedOrderType("all")}
            className="bg-red-600 hover:bg-red-700"
          >
            All Orders
          </Button>
          <Button
            variant={selectedOrderType === "retail" ? "default" : "outline"}
            onClick={() => setSelectedOrderType("retail")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Retail
          </Button>
          <Button
            variant={selectedOrderType === "auction" ? "default" : "outline"}
            onClick={() => setSelectedOrderType("auction")}
            className="bg-red-600 hover:bg-red-700"
          >
            <Gavel className="h-4 w-4 mr-1" />
            Auction
          </Button>
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No orders found</p>
          <p className="text-gray-400">
            {searchTerm ? "Try adjusting your search criteria" : "Start shopping to see your orders here!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getOrderTypeIcon(order.orderType)}
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id}
                        {order.orderType === 'auction' && order.auction && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            - {order.auction.title}
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {order.orderType === 'auction' ? 'Auction Win' : 'Retail Purchase'} • 
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getPaymentStatusIcon(order.paymentStatus)}
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/48x48?text=No+Image";
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.title}</p>
                          <p className="text-xs text-gray-600">
                            Quantity: {item.quantity} × {formatCurrency(item.pricePerUnit)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.quantity * item.pricePerUnit)}
                          </p>
                          <Badge variant="outline" size="sm">
                            {item.product.productType === 'auction' ? 'Auction' : 'Retail'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <Truck className="h-4 w-4 inline mr-1" />
                      Shipping to: {order.shippingAddress}, {order.shippingCity}
                    </p>
                    {order.notes && (
                      <p className="text-sm text-gray-600">Notes: {order.notes}</p>
                    )}
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="text-sm text-gray-600">
                      Shipping: {formatCurrency(order.shippingCost)}
                    </p>
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {order.paymentStatus === 'pending' && (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Complete Payment
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      Download Invoice
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}