import NotificationTester from "@/components/admin/NotificationTester";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestNotificationsPage() {
  return (
    <AdminLayout>
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
                <p className="mb-4">
                  Order notification testing coming soon. This feature will allow testing
                  notification delivery for any existing order.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}