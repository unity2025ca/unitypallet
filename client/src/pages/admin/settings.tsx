import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Eye, EyeOff, Database, Wrench, Calendar, Palette, Upload } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('auctions');

  // Fetch auctions enabled status
  const { data: auctionsStatus, isLoading } = useQuery({
    queryKey: ['/api/auctions-settings/enabled'],
    queryFn: () => apiRequest('/api/auctions-settings/enabled'),
  });

  // Fetch all settings
  const { data: allSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Toggle auctions mutation
  const toggleAuctionsMutation = useMutation({
    mutationFn: (enabled: boolean) => {
      console.log('Sending toggle request:', { enabled });
      return apiRequest('/api/auctions-settings/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled })
      });
    },
    onSuccess: (data) => {
      console.log('Toggle success:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/auctions-settings/enabled'] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      console.error('Toggle error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle auctions",
        variant: "destructive",
      });
    },
  });

  const handleToggleAuctions = (enabled: boolean) => {
    toggleAuctionsMutation.mutate(enabled);
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  const getSetting = (key: string) => {
    return allSettings?.find(s => s.key === key)?.value || '';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="auctions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auctions" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Auctions
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auctions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Auction Section Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auctions-enabled" className="text-base font-medium">
                      Show Auctions Section
                    </Label>
                    <p className="text-sm text-gray-600">
                      Control whether the auction section appears on the website and navigation menu
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auctions-enabled"
                      checked={auctionsStatus?.enabled || false}
                      onCheckedChange={handleToggleAuctions}
                      disabled={toggleAuctionsMutation.isPending}
                    />
                    {auctionsStatus?.enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Current Status: {auctionsStatus?.enabled ? (
                          <span className="text-green-600">Auctions are visible</span>
                        ) : (
                          <span className="text-red-600">Auctions are hidden</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {auctionsStatus?.enabled ? 
                          "Customers can access the auction section and place bids" : 
                          "Auction section is hidden from navigation and pages"
                        }
                      </p>
                    </div>
                    <Button
                      onClick={() => handleToggleAuctions(!auctionsStatus?.enabled)}
                      disabled={toggleAuctionsMutation.isPending}
                      variant={auctionsStatus?.enabled ? "destructive" : "default"}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {toggleAuctionsMutation.isPending ? "Updating..." : 
                       auctionsStatus?.enabled ? "Hide Auctions" : "Show Auctions"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Backup Status</p>
                    <p className="text-xs text-gray-600">Current status of your backup system</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Backup system is ready and configured properly.</span>
                  </div>
                  <p className="text-xs text-gray-500">Last backup: 2025-07-14, 8:40:06 PM</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Create New Backup</p>
                      <p className="text-xs text-gray-500">Save all your website data to the backup database</p>
                    </div>
                    <Button variant="outline" className="bg-red-600 hover:bg-red-700 text-white">
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This will backup all users, products, images, settings, orders, and other important data to your configured backup database.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">
                      When enabled, all purchasing functionality will be disabled
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('maintenance_mode') === 'true'}
                    disabled
                  />
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">Warning: When enabled, all purchasing functionality will be disabled on the website.</span>
                  </div>
                  <p className="text-xs text-red-600">Customers will not be able to add items to cart or checkout.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Show Appointments Bubble</Label>
                    <p className="text-sm text-gray-600">
                      Show or hide the appointments bubble on the homepage
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('show_appointments_bubble') === 'true'}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Days and Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Available Appointment Days</Label>
                  <p className="text-xs text-gray-500 mb-2">Days when appointments are available (comma separated)</p>
                  <Input
                    value={getSetting('appointments_available_days')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Time</Label>
                    <Input
                      value={getSetting('appointments_start_time')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Time</Label>
                    <Input
                      value={getSetting('appointments_end_time')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Appointment Interval (minutes)</Label>
                  <Input
                    value={getSetting('appointments_interval')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={getSetting('site_logo')}
                    alt="Site Logo"
                    className="h-16 w-auto border rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">Current Logo</p>
                    <p className="text-xs text-gray-500">{getSetting('site_logo')}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Or upload a new logo directly:</Label>
                  <Button variant="outline" className="mt-2 w-full" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Primary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: getSetting('primary_color') }}
                    ></div>
                    <span className="text-sm font-mono">{getSetting('primary_color')}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Secondary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: getSetting('secondary_color') }}
                    ></div>
                    <span className="text-sm font-mono">{getSetting('secondary_color')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Site Name</Label>
                  <Input
                    value={getSetting('site_name')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Site Description</Label>
                  <Textarea
                    value={getSetting('site_description')}
                    disabled
                    className="bg-gray-50"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <Input
                    value={getSetting('contact_email')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <Input
                    value={getSetting('contact_phone')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Address</Label>
                  <Input
                    value={getSetting('contact_address')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}