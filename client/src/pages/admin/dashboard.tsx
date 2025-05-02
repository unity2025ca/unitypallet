import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import translations from "@/lib/i18n-temp"; // Using temporary i18n file
import { Product } from "@shared/schema";
import { Activity, Calendar, Users, Package, Mail, Settings, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Redirect } from "wouter";

const AdminDashboard = () => {
  const [showSecurityTips, setShowSecurityTips] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }
  
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
  });
  
  // Fetch subscribers for dashboard stats
  const { data: subscribers } = useQuery<any[]>({
    queryKey: ["/api/admin/subscribers"],
  });
  
  // Calculate stats for dashboard
  const totalProducts = products?.length || 0;
  const totalContacts = contacts?.length || 0;
  const totalSubscribers = subscribers?.length || 0;
  
  // Get product status counts
  const availableProducts = products?.filter(p => p.status === 'available').length || 0;
  const limitedProducts = products?.filter(p => p.status === 'limited').length || 0;
  const soldoutProducts = products?.filter(p => p.status === 'soldout').length || 0;
  
  return (
    <AdminLayout title="Dashboard">
      {/* Security Tips Alert - only shown to first-time users */}
      {showSecurityTips && (
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Security Reminder</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Please remember to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Log out when you're done</li>
              <li>Never share your admin credentials</li>
              <li>Use a strong, unique password</li>
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSecurityTips(false)} 
              className="mt-2"
            >
              Don't show again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="security" className="hidden lg:inline-flex">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {availableProducts} available, {limitedProducts} limited, {soldoutProducts} sold out
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalContacts}</div>
                <p className="text-xs text-muted-foreground">
                  Customer inquiries via contact form
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Email subscribers for newsletter
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Admin system is online and running
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Overview of recent system activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Activity tracking will be available soon</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Commonly performed admin tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = "/admin/products"}>
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = "/admin/settings"}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = "/admin/appointments"}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Appointments
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage your store's inventory and product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Product Catalog</h3>
                    <p className="text-sm text-muted-foreground">Manage your store inventory</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/admin/products"}
                  >
                    Access
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <Settings className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Product Categories</h3>
                    <p className="text-sm text-muted-foreground">Manage category settings</p>
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
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Manage appointments and customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Contact Messages</h3>
                    <p className="text-sm text-muted-foreground">View and respond to customer inquiries</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/admin/contacts"}
                  >
                    Access
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Appointments</h3>
                    <p className="text-sm text-muted-foreground">Manage customer appointments</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/admin/appointments"}
                  >
                    Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">System Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure system security settings</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/admin/settings?tab=system"}
                  >
                    Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;