import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Order } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function OrdersPage() {
  const { customer } = useCustomerAuth();
  const [_, setLocation] = useLocation();
  
  // Fetch customer orders
  const { 
    data: orders, 
    isLoading: ordersLoading 
  } = useQuery<any[]>({
    queryKey: ["/api/customer/orders"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!customer,
  });

  // Format date to locale string
  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get order status badge color
  const getOrderStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
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
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  // Get payment status badge color
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
    return `C$${price.toFixed(2)}`;
  };

  if (!customer) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>
        <Button onClick={() => setLocation("/account")}>
          My Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View all your previous orders and track their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Browse our products and start shopping!
              </p>
              <Button onClick={() => setLocation("/products")}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Order Number
                      </div>
                      <div className="font-medium">#{order.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Date
                      </div>
                      <div className="font-medium">
                        {formatDate(order.created_at || order.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Total
                      </div>
                      <div className="font-medium">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status || order.paymentStatus)}`}>
                        {getPaymentStatusText(order.payment_status || order.paymentStatus)}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setLocation(`/orders/${order.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}