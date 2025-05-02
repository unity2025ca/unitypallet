import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Order, OrderItem } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface OrderDetails extends Order {
  items: (OrderItem & { title?: string; price?: number; imageUrl?: string })[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const { customer } = useCustomerAuth();
  const [_, setLocation] = useLocation();
  const orderId = params.id;

  // Fetch specific order details
  const {
    data: order,
    isLoading,
    error
  } = useQuery<OrderDetails>({
    queryKey: [`/api/customer/orders/${orderId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!customer && !!orderId,
  });

  // Format date to locale string
  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get order status color
  const getOrderStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get human-readable status
  const getStatusText = (status: string | null) => {
    if (!status) return "Not specified";
    
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get human-readable payment status
  const getPaymentStatusText = (status: string | null) => {
    if (!status) return "Not specified";
    
    switch (status) {
      case "pending":
        return "Pending";
      case "paid":
        return "Paid";
      case "failed":
        return "Payment Failed";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  // Format price to Canadian dollars
  const formatPrice = (price: number) => {
    return `C$${(price / 100).toFixed(2)}`;
  };

  if (!customer) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => setLocation("/account")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Account
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading your order. Please try again later.
          </AlertDescription>
        </Alert>
      ) : !order ? (
        <Alert className="mb-6">
          <Package className="h-4 w-4 mr-2" />
          <AlertTitle>Order Not Found</AlertTitle>
          <AlertDescription>
            We couldn't find this order. It may have been removed or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>
                Placed on {formatDate(order.createdAt)}
              </CardDescription>
              <div className="flex space-x-2 mt-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium text-lg mb-4">Items</h3>
              {(!order.items || order.items.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground">
                  No items found in this order.
                </div>
              ) : (
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                      <div className="bg-secondary h-16 w-16 rounded flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title || 'Product'} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title || `Product #${item.productId}`}</h4>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.pricePerUnit * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Price Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatPrice(order.total - (order.shippingCost || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{formatPrice(order.shippingCost || 0)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Shipping Information</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{order.shippingAddress || "No shipping address provided"}</p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <h4 className="font-medium mb-2">Additional Notes</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/contact")}
              >
                Need Help? Contact Us
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}