import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import translations from "@/lib/i18n";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
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
        <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
        <div className="flex-1 p-4 md:p-8 md:ml-64">
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu />
          </Button>
        </div>
        
        {/* Desktop Title */}
        <h1 className="hidden md:block text-3xl font-bold mb-6">
          {translations.admin.dashboard.title}
        </h1>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 md:mb-8">
          <h2 className="text-xl font-semibold mb-2 md:mb-4">
            {translations.admin.dashboard.welcome}
          </h2>
          <p className="text-gray-600">
            Welcome {user?.username}, you can manage your website here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Products Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {translations.admin.dashboard.stats.products}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-box-open mr-2"></i>
                Available Products
              </div>
            </CardContent>
          </Card>
          
          {/* Contacts Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {translations.admin.dashboard.stats.contacts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contacts?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-envelope mr-2"></i>
                Contact Messages
              </div>
            </CardContent>
          </Card>
          
          {/* Subscribers Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {translations.admin.dashboard.stats.subscribers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subscribers?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-users mr-2"></i>
                Email Subscribers
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/admin/products")}>
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <i className="fas fa-plus text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium">Add New Product</h3>
                  <p className="text-sm text-muted-foreground">Add a new pallet to the store</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/admin/orders")}>
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <i className="fas fa-envelope-open text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium">View Messages</h3>
                  <p className="text-sm text-muted-foreground">Check customer messages</p>
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
