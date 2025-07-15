import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Eye, EyeOff } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch auctions enabled status
  const { data: auctionsStatus, isLoading } = useQuery({
    queryKey: ['/api/auctions-settings/enabled'],
    queryFn: () => apiRequest('/api/auctions-settings/enabled'),
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Site Settings</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Site Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Auction Settings */}
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

        {/* Site Information Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Site Logo</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <img 
                      src={auctionsStatus?.enabled ? "https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg" : "https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg"}
                      alt="Site Logo"
                      className="h-12 w-auto"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current site logo</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Site Name</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-lg font-semibold">Jaberco</p>
                    <p className="text-xs text-gray-500 mt-1">Site title and name</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">contact@jaberco.com</p>
                    <p className="text-xs text-gray-500 mt-1">Customer support email</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500 mt-1">Customer service phone</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Business Address</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">123 Business Street, Suite 100</p>
                  <p className="text-sm">Toronto, ON M5V 3A8, Canada</p>
                  <p className="text-xs text-gray-500 mt-1">Physical business address</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Website Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Privacy Policy</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">Privacy policy content available</p>
                    <Button variant="outline" size="sm" className="mt-2">Edit Policy</Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Terms of Service</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">Terms of service content available</p>
                    <Button variant="outline" size="sm" className="mt-2">Edit Terms</Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Return Policy</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">Return policy content available</p>
                    <Button variant="outline" size="sm" className="mt-2">Edit Policy</Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Shipping Policy</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">Shipping policy content available</p>
                    <Button variant="outline" size="sm" className="mt-2">Edit Policy</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500 mt-1">WhatsApp support number</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Facebook</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">facebook.com/jaberco</p>
                    <p className="text-xs text-gray-500 mt-1">Facebook page link</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Instagram</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">@jaberco_official</p>
                    <p className="text-xs text-gray-500 mt-1">Instagram handle</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Twitter</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">@jaberco</p>
                    <p className="text-xs text-gray-500 mt-1">Twitter handle</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}