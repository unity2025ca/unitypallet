import { useState } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Order } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, ShoppingBag, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { customer, logoutMutation } = useCustomerAuth();
  const [_, setLocation] = useLocation();

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
    if (!date) return "غير محدد";
    return new Date(date).toLocaleDateString("ar-SA", {
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
    if (!status) return "غير محدد";
    
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "processing":
        return "قيد التجهيز";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      case "refunded":
        return "مسترجع";
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
    if (!status) return "غير محدد";
    
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "paid":
        return "مدفوع";
      case "failed":
        return "فشل الدفع";
      case "refunded":
        return "مسترجع";
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">حسابي</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="ml-2 h-4 w-4" />
          )}
          تسجيل الخروج
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            طلباتي
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>
                مراجعة وتحديث معلومات حسابك الشخصية.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    اسم المستخدم
                  </div>
                  <div className="text-lg">{customer.username}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    الاسم الكامل
                  </div>
                  <div className="text-lg">{customer.fullName || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    البريد الإلكتروني
                  </div>
                  <div className="text-lg">{customer.email || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    رقم الهاتف
                  </div>
                  <div className="text-lg">{customer.phone || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    العنوان
                  </div>
                  <div className="text-lg">{customer.address || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    المدينة
                  </div>
                  <div className="text-lg">{customer.city || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    الرمز البريدي
                  </div>
                  <div className="text-lg">{customer.postalCode || "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    البلد
                  </div>
                  <div className="text-lg">{customer.country || "غير محدد"}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full md:w-auto">تحديث المعلومات</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>سجل الطلبات</CardTitle>
              <CardDescription>
                عرض جميع طلباتك السابقة وتتبع حالتها.
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
                  <h3 className="text-lg font-medium mb-2">لا توجد طلبات بعد</h3>
                  <p className="text-muted-foreground mb-6">
                    لم تقم بإجراء أي طلبات حتى الآن. تصفح منتجاتنا وابدأ التسوق!
                  </p>
                  <Button onClick={() => setLocation("/products")}>
                    تصفح المنتجات
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            رقم الطلب
                          </div>
                          <div className="font-medium">#{order.id}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            التاريخ
                          </div>
                          <div className="font-medium">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            المجموع
                          </div>
                          <div className="font-medium">
                            {formatPrice(order.total)}
                          </div>
                        </div>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setLocation(`/orders/${order.id}`)}
                      >
                        عرض التفاصيل
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