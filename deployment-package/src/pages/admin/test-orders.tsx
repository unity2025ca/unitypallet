import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function TestOrderNotificationsPage() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Test notification mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/admin/notifications/test-order-notifications/${id}`);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Test result:", data);
      if (data.success) {
        toast({
          title: "Test notifications sent",
          description: data.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Test failed",
          description: data.error || "Unknown error occurred during the test",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to run notification test",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderId.trim());
    if (isNaN(id) || id <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid order ID",
        description: "Please enter a valid order ID number",
      });
      return;
    }
    testMutation.mutate(id);
  };

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
          <h1 className="text-3xl font-bold mb-6">Test Order Notifications</h1>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Send Test Notifications for an Order</CardTitle>
              <CardDescription>
                Enter an order ID to test sending email and SMS notifications for that order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="orderId"
                      placeholder="Enter order ID number"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      type="number"
                      min="1"
                    />
                    <Button type="submit" disabled={testMutation.isPending}>
                      {testMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {testMutation.isSuccess && (
                  <Alert className={testMutation.data.success ? "bg-green-50" : "bg-red-50"}>
                    {testMutation.data.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle>
                      {testMutation.data.success ? "Test Successful" : "Test Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {testMutation.data.message || "No message provided"}
                      {testMutation.data.success && (
                        <div className="mt-2 text-sm">
                          <div>Email sent: {testMutation.data.emailSent ? "Yes" : "No"}</div>
                          <div>SMS sent: {testMutation.data.smsSent ? "Yes" : "No"}</div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {testMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {(testMutation.error as Error)?.message || "An unexpected error occurred"}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}