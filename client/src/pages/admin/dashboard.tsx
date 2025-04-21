import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import translations from "@/lib/i18n";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@shared/schema";

const AdminDashboard = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  
  // Fetch products for dashboard stats
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Fetch contacts for dashboard stats
  const { data: contacts } = useQuery<any[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated,
  });
  
  // Fetch subscribers for dashboard stats
  const { data: subscribers } = useQuery<any[]>({
    queryKey: ["/api/admin/subscribers"],
    enabled: isAuthenticated,
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 mr-64">
        <h1 className="text-3xl font-bold mb-6 font-tajawal">
          {translations.admin.dashboard.title}
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 font-tajawal">
            {translations.admin.dashboard.welcome}
          </h2>
          <p className="text-gray-600">
            مرحباً {user?.username}، يمكنك إدارة الموقع من هنا.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Products Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-tajawal">
                {translations.admin.dashboard.stats.products}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-box-open ml-2"></i>
                منتج متاح للبيع
              </div>
            </CardContent>
          </Card>
          
          {/* Contacts Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-tajawal">
                {translations.admin.dashboard.stats.contacts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contacts?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-envelope ml-2"></i>
                رسالة تواصل
              </div>
            </CardContent>
          </Card>
          
          {/* Subscribers Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-tajawal">
                {translations.admin.dashboard.stats.subscribers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subscribers?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-users ml-2"></i>
                مشترك في القائمة البريدية
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 font-tajawal">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/admin/products")}>
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                  <i className="fas fa-plus text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium">إضافة منتج جديد</h3>
                  <p className="text-sm text-muted-foreground">أضف بالة جديدة للمتجر</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/admin/orders")}>
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                  <i className="fas fa-envelope-open text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium">عرض الرسائل</h3>
                  <p className="text-sm text-muted-foreground">اطلع على رسائل العملاء</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
