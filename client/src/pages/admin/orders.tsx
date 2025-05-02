import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import translations from "@/lib/i18n-temp";
import Sidebar from "@/components/admin/Sidebar";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Order as SchemaOrder } from "@shared/schema";

// Extended Order type for admin panel with customer information from API
interface OrderWithCustomer {
  // Base order properties
  id: number;
  createdAt: Date | null;
  userId: number;
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded" | null;
  total: number;
  notes: string | null;
  updatedAt: Date | null;
  
  // Customer information from users table
  full_name?: string;
  email?: string;
  phone?: string;
  
  // Shipping information from orders table
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_province?: string;
  
  // Payment information
  payment_method?: string;
  payment_status?: "pending" | "refunded" | "paid" | "failed" | null;
  
  // Order items
  items?: Array<{
    id: number;
    product_id: number;
    order_id: number;
    quantity: number;
    price_per_unit: number;
    title?: string;
    price?: number;
    image_url?: string;
  }>;
  
  // Any other properties from SchemaOrder that might be needed
  // Property getter for backward compatibility
  paymentStatus?: "pending" | "refunded" | "paid" | "failed" | null;
}
import { toast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw, Eye, Package, Truck, CheckCircle, XCircle, Ban, CreditCard, AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Payment Status Badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return <Badge className="bg-green-500 hover:bg-green-600"><CreditCard className="h-3 w-3 mr-1" />مدفوع</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" />في انتظار الدفع</Badge>;
    case 'failed':
      return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" />فشل الدفع</Badge>;
    case 'refunded':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><RefreshCw className="h-3 w-3 mr-1" />مسترد</Badge>;
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600">غير معروف</Badge>;
  }
};

// Order Status Badge component
const OrderStatusBadge = ({ status }: { status: string }) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Package className="h-3 w-3 mr-1" />قيد الانتظار</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><RefreshCw className="h-3 w-3 mr-1" />قيد التجهيز</Badge>;
    case 'completed':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />تم الاكتمال</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500 hover:bg-red-600"><Ban className="h-3 w-3 mr-1" />ملغي</Badge>;
    case 'refunded':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><RefreshCw className="h-3 w-3 mr-1" />مسترد</Badge>;
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600">غير معروف</Badge>;
  }
};

const AdminOrders = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch orders
  const { 
    data: orders, 
    isLoading: isLoadingOrders,
    refetch: refetchOrders
  } = useQuery<OrderWithCustomer[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated,
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الطلب بنجاح",
        description: "تم تحديث حالة الطلب وإشعار العميل",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setViewOrderId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تحديث حالة الطلب",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: number, paymentStatus: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/payment-status`, { paymentStatus });
      if (!res.ok) {
        throw new Error("Failed to update payment status");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الدفع بنجاح",
        description: "تم تحديث حالة الدفع وإشعار العميل",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setViewOrderId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تحديث حالة الدفع",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8 mr-64">
          <div className="flex justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }
  
  // Format date function
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "غير محدد";
    try {
      const date = new Date(dateString);
      return format(date, "PPpp", { locale: ar });
    } catch (error) {
      return "تاريخ غير صالح";
    }
  };
  
  // Format price function
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "غير محدد";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(price);
  };
  
  // Filter orders based on search, status, and payment status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      searchQuery === "" || 
      order.id.toString().includes(searchQuery) ||
      (order.full_name && order.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.phone && order.phone.includes(searchQuery));
    
    const matchesStatusFilter = 
      statusFilter === "all" || 
      order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesPaymentStatusFilter = 
      paymentStatusFilter === "all" || 
      (order.payment_status && order.payment_status.toLowerCase() === paymentStatusFilter.toLowerCase());
    
    return matchesSearch && matchesStatusFilter && matchesPaymentStatusFilter;
  });
  
  // Get order by ID
  const getOrderById = (id: number) => {
    return orders?.find(order => order.id === id);
  };
  
  // Handle status update
  const handleStatusUpdate = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };
  
  // Handle payment status update
  const handlePaymentStatusUpdate = (id: number, paymentStatus: string) => {
    updatePaymentStatusMutation.mutate({ id, paymentStatus });
  };
  
  // Filter orders by tab
  const getOrdersByTab = (tabId: string) => {
    if (tabId === "all") return filteredOrders;
    return filteredOrders?.filter(order => {
      switch (tabId) {
        case "pending": return order.status?.toLowerCase() === "pending";
        case "processing": return order.status?.toLowerCase() === "processing";
        case "completed": return order.status?.toLowerCase() === "completed";
        case "cancelled": return order.status?.toLowerCase() === "cancelled";
        default: return true;
      }
    });
  };
  
  // Calculate the statistics for the orders
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(order => order.status?.toLowerCase() === "pending").length || 0;
  const processingOrders = orders?.filter(order => order.status?.toLowerCase() === "processing").length || 0;
  const shippedOrders = orders?.filter(order => order.status?.toLowerCase() === "shipped").length || 0;
  const deliveredOrders = orders?.filter(order => order.status?.toLowerCase() === "delivered").length || 0;
  const cancelledOrders = orders?.filter(order => order.status?.toLowerCase() === "cancelled").length || 0;
  
  const totalRevenue = orders?.reduce((sum, order) => {
    if (order.payment_status?.toLowerCase() === "paid") {
      return sum + (order.total || 0);
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 mr-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-tajawal">
            إدارة طلبات الشراء
          </h1>
          
          <Button 
            variant="outline" 
            onClick={() => refetchOrders()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1">{totalOrders}</div>
              <div className="text-sm text-gray-500">إجمالي الطلبات</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1 text-green-600">{deliveredOrders}</div>
              <div className="text-sm text-gray-500">طلبات تم تسليمها</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1 text-yellow-600">{pendingOrders + processingOrders}</div>
              <div className="text-sm text-gray-500">طلبات قيد المعالجة</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1 text-primary">{formatPrice(totalRevenue)}</div>
              <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Orders Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-tajawal text-2xl">طلبات الشراء</CardTitle>
            <CardDescription>
              إدارة طلبات الشراء من العملاء ومتابعة حالتها
            </CardDescription>
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو رقم الطلب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="حالة الطلب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="processing">قيد التجهيز</SelectItem>
                    <SelectItem value="completed">تم الاكتمال</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="refunded">مسترد</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="حالة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="pending">في انتظار الدفع</SelectItem>
                    <SelectItem value="failed">فشل الدفع</SelectItem>
                    <SelectItem value="refunded">مسترد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mx-6 mb-4">
              <TabsTrigger value="all">الكل ({filteredOrders?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">قيد الانتظار ({pendingOrders})</TabsTrigger>
              <TabsTrigger value="processing">قيد التجهيز ({processingOrders})</TabsTrigger>
              <TabsTrigger value="completed">تم الاكتمال ({orders?.filter(order => order.status?.toLowerCase() === "completed").length || 0})</TabsTrigger>
              <TabsTrigger value="cancelled">ملغي ({cancelledOrders})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="pt-0 mt-0">
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : getOrdersByTab(activeTab)?.length ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم الطلب</TableHead>
                          <TableHead>العميل</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>طريقة الدفع</TableHead>
                          <TableHead>حالة الدفع</TableHead>
                          <TableHead>حالة الطلب</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getOrdersByTab(activeTab)?.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{order.full_name || "غير محدد"}</div>
                              <div className="text-sm text-muted-foreground">{order.email || "غير محدد"}</div>
                            </TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              {order.payment_method === "credit_card" ? "بطاقة ائتمان" : 
                               order.payment_method === "cash_on_delivery" ? "الدفع عند الاستلام" : 
                               order.payment_method || "غير محدد"}
                            </TableCell>
                            <TableCell>
                              <PaymentStatusBadge status={order.payment_status || "pending"} />
                            </TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status || "pending"} />
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => setViewOrderId(order.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>عرض تفاصيل الطلب</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد طلبات</h3>
                    <p className="text-gray-500">لم يتم العثور على طلبات تطابق معايير البحث</p>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Order Details Dialog */}
        {viewOrderId && (
          <Dialog open={viewOrderId !== null} onOpenChange={(open) => !open && setViewOrderId(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="font-tajawal text-xl flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  تفاصيل الطلب #{viewOrderId}
                </DialogTitle>
                <DialogDescription>
                  {viewOrderId ? formatDate(getOrderById(viewOrderId)?.createdAt) : "تاريخ غير محدد"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الاسم:</span>
                        <span className="font-medium">{getOrderById(viewOrderId)?.full_name || "غير محدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني:</span>
                        <span className="font-medium" dir="ltr">{getOrderById(viewOrderId)?.email || "غير محدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">رقم الهاتف:</span>
                        <span className="font-medium" dir="ltr">{getOrderById(viewOrderId)?.phone || "غير محدد"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Information */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">معلومات الشحن</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span className="font-medium">{getOrderById(viewOrderId)?.shipping_address || "غير محدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المدينة:</span>
                        <span className="font-medium">{getOrderById(viewOrderId)?.shipping_city || "غير محدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المقاطعة/الولاية:</span>
                        <span className="font-medium">{getOrderById(viewOrderId)?.shipping_province || "غير محدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الرمز البريدي:</span>
                        <span className="font-medium" dir="ltr">{getOrderById(viewOrderId)?.shipping_postal_code || "غير محدد"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البلد:</span>
                        <span className="font-medium">{getOrderById(viewOrderId)?.shipping_country || "غير محدد"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Order Items */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">المنتجات المطلوبة</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>المنتج</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>المجموع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getOrderById(viewOrderId)?.items?.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{item.title || "منتج غير معروف"}</div>
                          </TableCell>
                          <TableCell>{formatPrice(item.price_per_unit)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.price_per_unit * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <span className="font-semibold">المجموع النهائي:</span>
                  <span className="font-bold text-lg">{formatPrice(getOrderById(viewOrderId)?.total)}</span>
                </CardFooter>
              </Card>
              
              {/* Additional Information */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">معلومات إضافية</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">طريقة الدفع:</span>
                      <span className="font-medium">
                        {getOrderById(viewOrderId)?.payment_method === "credit_card" ? "بطاقة ائتمان" : 
                         getOrderById(viewOrderId)?.payment_method === "cash_on_delivery" ? "الدفع عند الاستلام" : 
                         getOrderById(viewOrderId)?.payment_method || "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">حالة الدفع:</span>
                      <PaymentStatusBadge status={getOrderById(viewOrderId)?.payment_status || "pending"} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">حالة الطلب:</span>
                      <OrderStatusBadge status={getOrderById(viewOrderId)?.status || "pending"} />
                    </div>
                    <div className="mt-4">
                      <span className="text-muted-foreground block mb-2">ملاحظات:</span>
                      <Textarea 
                        value={getOrderById(viewOrderId)?.notes || "لا توجد ملاحظات"} 
                        disabled 
                        className="min-h-[80px] bg-gray-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <div className="sm:flex-1 w-full">
                  <Select 
                    onValueChange={(value) => handleStatusUpdate(viewOrderId, value)}
                    defaultValue={getOrderById(viewOrderId)?.status || "pending"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="تحديث حالة الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="processing">قيد التجهيز</SelectItem>
                      <SelectItem value="completed">تم الاكتمال</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                      <SelectItem value="refunded">مسترد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="sm:flex-1 w-full">
                  <Select 
                    onValueChange={(value) => handlePaymentStatusUpdate(viewOrderId, value)}
                    defaultValue={getOrderById(viewOrderId)?.payment_status || "pending"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="تحديث حالة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">في انتظار الدفع</SelectItem>
                      <SelectItem value="paid">مدفوع</SelectItem>
                      <SelectItem value="failed">فشل الدفع</SelectItem>
                      <SelectItem value="refunded">مسترد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={() => setViewOrderId(null)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
