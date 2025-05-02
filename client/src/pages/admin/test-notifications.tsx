import { useState, useEffect } from "react";
import { useLocation, Redirect, Link } from "wouter";
import NotificationTester from "@/components/admin/NotificationTester";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

export default function TestNotificationsPage() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <Redirect to="/admin/login" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Notification Testing</h1>
          
          <Tabs defaultValue="tester" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tester">Test Services</TabsTrigger>
              <TabsTrigger value="orders">Test Order Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tester" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Test</CardTitle>
                  <CardDescription>
                    Test email and SMS delivery services directly to verify configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationTester />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Notifications Test</CardTitle>
                  <CardDescription>
                    Test sending order confirmation notifications for existing orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <p className="text-center max-w-md">
                      You can test sending notifications for any order to verify that the 
                      email and SMS notifications are working correctly.
                    </p>
                    <Button onClick={() => navigate('/admin/test-orders')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Go to Order Notification Tester
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}