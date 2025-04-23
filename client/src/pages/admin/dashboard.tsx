import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import translations from "@/lib/i18n";
import Sidebar from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { Activity, Calendar, Users, Package, Mail, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSecurityTips, setShowSecurityTips] = useState(true);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Initialize environment checks
  useEffect(() => {
    // Check for session storage to determine if user is returning
    const hasVisitedBefore = sessionStorage.getItem('adminDashboardVisited');
    if (hasVisitedBefore) {
      setShowSecurityTips(false);
    } else {
      sessionStorage.setItem('adminDashboardVisited', 'true');
    }
  }, []);
  
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
  
  // Use useEffect to handle navigation for authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  // Return null while loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header with admin info and notifications */}
        <Header title={translations.admin.dashboard.title} toggleMobileMenu={toggleMobileMenu} user={user} />
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {translations.admin.dashboard.welcome}
              </h2>
              <p className="text-blue-100">
                Welcome back, <span className="font-semibold">{user?.username}</span>. Here's what's happening with your store today.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                <Activity className="w-4 h-4 mr-2" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Tips Alert - Only shown to new users */}
        {showSecurityTips && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-md shadow">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Important Security Tips</h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1 list-disc pl-5">
                  <li>Always log out when you're done using the admin panel</li>
                  <li>Never share your login credentials with anyone</li>
                  <li>Regularly update your password in the security settings</li>
                  <li>Monitor user permissions closely and review regularly</li>
                </ul>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-amber-800 border-amber-300 hover:bg-amber-100"
                    onClick={() => setShowSecurityTips(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Products Card */}
          <Card className="overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader className="pb-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {translations.admin.dashboard.stats.products}
                  </CardTitle>
                  <CardDescription>Total product count</CardDescription>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-blue-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{products?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <i className="fas fa-arrow-up mr-1"></i>
                <span>Active in stock</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Contacts Card */}
          <Card className="overflow-hidden border-t-4 border-t-amber-500">
            <CardHeader className="pb-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {translations.admin.dashboard.stats.contacts}
                  </CardTitle>
                  <CardDescription>Customer inquiries</CardDescription>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-amber-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{contacts?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-envelope mr-2"></i>
                <span>Total messages</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscribers Card */}
          <Card className="overflow-hidden border-t-4 border-t-green-500">
            <CardHeader className="pb-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {translations.admin.dashboard.stats.subscribers}
                  </CardTitle>
                  <CardDescription>Newsletter audience</CardDescription>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{subscribers?.length || 0}</div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <i className="fas fa-users mr-2"></i>
                <span>Active subscribers</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Access Tabs */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Management Tools</h2>
            <div className="text-sm text-muted-foreground">Quick-access links</div>
          </div>
          
          <Tabs defaultValue="quickActions" className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="quickActions">Quick Actions</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quickActions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border cursor-pointer hover:shadow-md transition-all" 
                      onClick={() => window.location.href = "/admin/products"}>
                  <CardContent className="p-4 flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Add New Product</h3>
                      <p className="text-sm text-muted-foreground">Add a new pallet to the store</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border cursor-pointer hover:shadow-md transition-all" 
                      onClick={() => window.location.href = "/admin/orders"}>
                  <CardContent className="p-4 flex items-center">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                      <Mail className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">View Messages</h3>
                      <p className="text-sm text-muted-foreground">Check customer messages</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border cursor-pointer hover:shadow-md transition-all" 
                      onClick={() => window.location.href = "/admin/appointments"}>
                  <CardContent className="p-4 flex items-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Appointments</h3>
                      <p className="text-sm text-muted-foreground">Manage customer appointments</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Center</CardTitle>
                  <CardDescription>Manage security settings and users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">User Management</h3>
                        <p className="text-sm text-muted-foreground">Manage staff accounts and permissions</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = "/admin/users"}
                      >
                        Access
                      </Button>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Security Log</h3>
                        <p className="text-sm text-muted-foreground">View recent login activity</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = "/admin/settings"}
                      >
                        Access
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Website Settings</CardTitle>
                  <CardDescription>Configure your website appearance and behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Site Configuration</h3>
                      <p className="text-sm text-muted-foreground">Customize site appearance and settings</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = "/admin/settings"}
                    >
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Footer with security information */}
        <div className="mt-auto">
          <div className="bg-gray-50 text-gray-500 text-xs p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p>Last login: {new Date().toLocaleString()}</p>
                <p className="mt-1">Please report any security concerns to the administrator.</p>
              </div>
              <div className="text-right">
                <p>Unity Admin Panel v1.0</p>
                <p className="mt-1">© {new Date().getFullYear()} Unity Inc. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
