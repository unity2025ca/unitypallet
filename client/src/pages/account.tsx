import { useState, useEffect } from "react";
import { useCustomerAuth, CustomerProfileUpdate } from "@/hooks/use-customer-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Order } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, ShoppingBag, User, LogOut, CheckCircle2, X } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { customer, logoutMutation } = useCustomerAuth();
  const [_, setLocation] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check for successful order completion from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const orderSuccess = params.get('order_success');
    const orderId = params.get('order_id');
    
    if (orderSuccess === 'true' && orderId) {
      // Show success toast
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${orderId} has been placed successfully. Thank you for your purchase!`,
      });
      
      // Set active tab to orders to show the new order
      setActiveTab("orders");
      
      // Refresh orders data
      queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
      
      // Clean URL parameters by replacing the current URL without the query params
      const url = window.location.pathname;
      window.history.replaceState({}, "", url);
    }
  }, [searchParams, toast, queryClient]);

  // Fetch customer orders
  const { 
    data: orders, 
    isLoading: ordersLoading 
  } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!customer,
  });

  // Handle logout button click
  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/");
  };

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

  // Profile Update Dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { updateProfileMutation } = useCustomerAuth();
  
  // Set up form with useForm hook
  const form = useForm<CustomerProfileUpdate>({
    defaultValues: {
      fullName: customer?.fullName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      city: customer?.city || "",
      postalCode: customer?.postalCode || "",
      country: customer?.country || "",
    }
  });
  
  // Handle profile update form submission
  const handleProfileUpdate = (data: CustomerProfileUpdate) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        setProfileDialogOpen(false);
      }
    });
  };

  if (!customer) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Orders
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Review and update your personal account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Username
                  </div>
                  <div className="text-lg">{customer.username}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </div>
                  <div className="text-lg">{customer.fullName || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </div>
                  <div className="text-lg">{customer.email || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </div>
                  <div className="text-lg">{customer.phone || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Address
                  </div>
                  <div className="text-lg">{customer.address || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    City
                  </div>
                  <div className="text-lg">{customer.city || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Postal Code
                  </div>
                  <div className="text-lg">{customer.postalCode || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Country
                  </div>
                  <div className="text-lg">{customer.country || "Not specified"}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full md:w-auto">Update Information</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
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
                  {orders.map((order) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}