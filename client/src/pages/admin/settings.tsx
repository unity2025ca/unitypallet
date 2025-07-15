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
import { Settings, Eye, EyeOff, Database, Wrench, Calendar, Palette, Upload, Save, Loader2 } from "lucide-react";

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
      return apiRequest('POST', '/api/auctions-settings/toggle', { enabled });
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

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => {
      return apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const handleUpdateSetting = (key: string, value: string) => {
    // Immediate update for better UX
    updateSettingMutation.mutate({ key, value });
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
          <TabsTrigger value="auctions" className="flex items-center gap-2 text-xs">
            <Eye className="h-3 w-3" />
            Auctions
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2 text-xs">
            <Wrench className="h-3 w-3" />
            System
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs">
            <Palette className="h-3 w-3" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="homepage" className="flex items-center gap-2 text-xs">
            <Settings className="h-3 w-3" />
            Homepage
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

          <Card>
            <CardHeader>
              <CardTitle>Appointments System</CardTitle>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Available Days</Label>
                    <Input
                      value={getSetting('appointments_available_days')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Interval (minutes)</Label>
                    <Input
                      value={getSetting('appointments_interval')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Page Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">About Page Title</Label>
                  <Input
                    value={getSetting('about_title')}
                    onChange={(e) => handleUpdateSetting('about_title', e.target.value)}
                    placeholder="Enter about page title"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">About Page Subtitle</Label>
                  <Input
                    value={getSetting('about_subtitle')}
                    onChange={(e) => handleUpdateSetting('about_subtitle', e.target.value)}
                    placeholder="Enter about page subtitle"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">About Description</Label>
                  <Textarea
                    value={getSetting('about_description')}
                    onChange={(e) => handleUpdateSetting('about_description', e.target.value)}
                    placeholder="Enter about description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Our Mission</Label>
                    <Textarea
                      value={getSetting('about_mission')}
                      onChange={(e) => handleUpdateSetting('about_mission', e.target.value)}
                      placeholder="Enter our mission"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Our Vision</Label>
                    <Textarea
                      value={getSetting('about_vision')}
                      onChange={(e) => handleUpdateSetting('about_vision', e.target.value)}
                      placeholder="Enter our vision"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Our History</Label>
                  <Textarea
                    value={getSetting('about_history')}
                    disabled
                    className="bg-gray-50"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Customers Count</Label>
                    <Input
                      value={getSetting('about_customers_count')}
                      onChange={(e) => handleUpdateSetting('about_customers_count', e.target.value)}
                      placeholder="Enter customers count"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Pallets Count</Label>
                    <Input
                      value={getSetting('about_pallets_count')}
                      onChange={(e) => handleUpdateSetting('about_pallets_count', e.target.value)}
                      placeholder="Enter pallets count"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">About Page Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <img 
                      src={getSetting('about_image')}
                      alt="About Image"
                      className="h-20 w-auto border rounded"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Current about page image</p>
                      <p className="text-xs text-gray-500 mt-1">{getSetting('about_image')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works Page</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">How It Works Title</Label>
                  <Input
                    value={getSetting('how_it_works_title')}
                    onChange={(e) => handleUpdateSetting('how_it_works_title', e.target.value)}
                    placeholder="Enter how it works title"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">How It Works Subtitle</Label>
                  <Input
                    value={getSetting('how_it_works_subtitle')}
                    onChange={(e) => handleUpdateSetting('how_it_works_subtitle', e.target.value)}
                    placeholder="Enter how it works subtitle"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Explanation Title</Label>
                  <Input
                    value={getSetting('how_it_works_explanation_title')}
                    onChange={(e) => handleUpdateSetting('how_it_works_explanation_title', e.target.value)}
                    placeholder="Enter explanation title"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Explanation Description</Label>
                  <Textarea
                    value={getSetting('how_it_works_explanation_description')}
                    onChange={(e) => handleUpdateSetting('how_it_works_explanation_description', e.target.value)}
                    placeholder="Enter explanation description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Step 1</Label>
                    <Input
                      value={getSetting('how_it_works_step1_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_step1_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Step 2</Label>
                    <Input
                      value={getSetting('how_it_works_step2_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_step2_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Step 3</Label>
                    <Input
                      value={getSetting('how_it_works_step3_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_step3_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Step 4</Label>
                    <Input
                      value={getSetting('how_it_works_step4_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_step4_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Product Type 1</Label>
                    <Input
                      value={getSetting('how_it_works_type1_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_type1_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Product Type 2</Label>
                    <Input
                      value={getSetting('how_it_works_type2_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_type2_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Product Type 3</Label>
                    <Input
                      value={getSetting('how_it_works_type3_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                    />
                    <Input
                      value={getSetting('how_it_works_type3_description')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
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
                    onChange={(e) => handleUpdateSetting('site_name', e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Site Description</Label>
                  <Textarea
                    value={getSetting('site_description')}
                    onChange={(e) => handleUpdateSetting('site_description', e.target.value)}
                    placeholder="Enter site description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <Input
                    value={getSetting('contact_email')}
                    onChange={(e) => handleUpdateSetting('contact_email', e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <Input
                    value={getSetting('contact_phone')}
                    onChange={(e) => handleUpdateSetting('contact_phone', e.target.value)}
                    placeholder="Enter contact phone"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Address</Label>
                  <Input
                    value={getSetting('contact_address')}
                    onChange={(e) => handleUpdateSetting('contact_address', e.target.value)}
                    placeholder="Enter contact address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banner Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Banner Title</Label>
                  <Input
                    value={getSetting('home_banner_title')}
                    onChange={(e) => handleUpdateSetting('home_banner_title', e.target.value)}
                    placeholder="Enter banner title"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Banner Subtitle</Label>
                  <Textarea
                    value={getSetting('home_banner_subtitle')}
                    onChange={(e) => handleUpdateSetting('home_banner_subtitle', e.target.value)}
                    placeholder="Enter banner subtitle"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Banner Button Text</Label>
                  <Input
                    value={getSetting('home_banner_button_text')}
                    onChange={(e) => handleUpdateSetting('home_banner_button_text', e.target.value)}
                    placeholder="Enter banner button text"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Banner Button Link</Label>
                  <Input
                    value={getSetting('home_banner_button_link')}
                    onChange={(e) => handleUpdateSetting('home_banner_button_link', e.target.value)}
                    placeholder="Enter banner button link"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Banner Background Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <img 
                      src={getSetting('home_banner_image')}
                      alt="Banner Image"
                      className="h-20 w-auto border rounded"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Current banner image</p>
                      <p className="text-xs text-gray-500 mt-1">{getSetting('home_banner_image')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Features Section Title</Label>
                  <Input
                    value={getSetting('home_features_title')}
                    onChange={(e) => handleUpdateSetting('home_features_title', e.target.value)}
                    placeholder="Enter features section title"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Features Section Subtitle</Label>
                  <Input
                    value={getSetting('home_features_subtitle')}
                    onChange={(e) => handleUpdateSetting('home_features_subtitle', e.target.value)}
                    placeholder="Enter features section subtitle"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Feature 1</Label>
                    <Input
                      value={getSetting('home_feature_1_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                      placeholder="Feature 1 Title"
                    />
                    <Textarea
                      value={getSetting('home_feature_1_description')}
                      disabled
                      className="bg-gray-50"
                      rows={2}
                      placeholder="Feature 1 Description"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Feature 2</Label>
                    <Input
                      value={getSetting('home_feature_2_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                      placeholder="Feature 2 Title"
                    />
                    <Textarea
                      value={getSetting('home_feature_2_description')}
                      disabled
                      className="bg-gray-50"
                      rows={2}
                      placeholder="Feature 2 Description"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Feature 3</Label>
                    <Input
                      value={getSetting('home_feature_3_title')}
                      disabled
                      className="bg-gray-50 mb-2"
                      placeholder="Feature 3 Title"
                    />
                    <Textarea
                      value={getSetting('home_feature_3_description')}
                      disabled
                      className="bg-gray-50"
                      rows={2}
                      placeholder="Feature 3 Description"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">About Section Title</Label>
                  <Input
                    value={getSetting('home_about_title')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">About Section Description</Label>
                  <Textarea
                    value={getSetting('home_about_description')}
                    disabled
                    className="bg-gray-50"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">About Button Text</Label>
                  <Input
                    value={getSetting('home_about_button_text')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">About Button Link</Label>
                  <Input
                    value={getSetting('home_about_button_link')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">About Section Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <img 
                      src={getSetting('home_about_image')}
                      alt="About Image"
                      className="h-20 w-auto border rounded"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Current about image</p>
                      <p className="text-xs text-gray-500 mt-1">{getSetting('home_about_image')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Products Section Title</Label>
                  <Input
                    value={getSetting('home_products_title')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Products Section Subtitle</Label>
                  <Input
                    value={getSetting('home_products_subtitle')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Number of Products to Display</Label>
                    <Input
                      value={getSetting('home_products_count')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">View All Products Button Text</Label>
                    <Input
                      value={getSetting('home_products_button_text')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Products Button Link</Label>
                  <Input
                    value={getSetting('home_products_button_link')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">CTA Section Title</Label>
                  <Input
                    value={getSetting('home_cta_title')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">CTA Section Description</Label>
                  <Textarea
                    value={getSetting('home_cta_description')}
                    disabled
                    className="bg-gray-50"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">CTA Button Text</Label>
                    <Input
                      value={getSetting('home_cta_button_text')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">CTA Button Link</Label>
                    <Input
                      value={getSetting('home_cta_button_link')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">CTA Background Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: getSetting('home_cta_background_color') }}
                    ></div>
                    <span className="text-sm font-mono">{getSetting('home_cta_background_color')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Social Media & Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Facebook URL</Label>
                    <Input
                      value={getSetting('social_facebook')}
                      onChange={(e) => handleUpdateSetting('social_facebook', e.target.value)}
                      placeholder="Enter Facebook URL"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Instagram URL</Label>
                    <Input
                      value={getSetting('social_instagram')}
                      onChange={(e) => handleUpdateSetting('social_instagram', e.target.value)}
                      placeholder="Enter Instagram URL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Twitter URL</Label>
                    <Input
                      value={getSetting('social_twitter')}
                      onChange={(e) => handleUpdateSetting('social_twitter', e.target.value)}
                      placeholder="Enter Twitter URL"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">YouTube URL</Label>
                    <Input
                      value={getSetting('social_youtube')}
                      onChange={(e) => handleUpdateSetting('social_youtube', e.target.value)}
                      placeholder="Enter YouTube URL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Instagram Handle</Label>
                    <Input
                      value={getSetting('instagram')}
                      onChange={(e) => handleUpdateSetting('instagram', e.target.value)}
                      placeholder="Enter Instagram handle"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Twitter Handle</Label>
                    <Input
                      value={getSetting('twitter')}
                      onChange={(e) => handleUpdateSetting('twitter', e.target.value)}
                      placeholder="Enter Twitter handle"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Google Maps Embed Code</Label>
                  <Textarea
                    value={getSetting('location_map')}
                    onChange={(e) => handleUpdateSetting('location_map', e.target.value)}
                    placeholder="Enter Google Maps embed code"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    HTML iframe embed code from Google Maps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}