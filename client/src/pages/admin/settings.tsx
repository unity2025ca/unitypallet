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
    mutationFn: (enabled: boolean) => apiRequest('/api/auctions-settings/toggle', {
      method: 'POST',
      body: { enabled }
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auctions-settings/enabled'] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
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

        {/* Additional Settings can be added here */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">More site settings will be available here in the future.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}