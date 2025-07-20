import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Eye, 
  FileText, 
  Gavel, 
  Settings, 
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  Download,
  Bell,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: number;
  avgBidsPerAuction: number;
  conversionRate: number;
}

interface Auction {
  id: number;
  title: string;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  startingPrice: number;
  currentBid: number;
  totalBids: number;
  endTime: string;
  winnerId?: number;
  winnerName?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  auctionTitle: string;
  winnerName: string;
  winningBidAmount: number;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface AuctionSetting {
  key: string;
  value: string;
  label: string;
  description: string;
  type: string;
}

export default function AuctionManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch auction statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AuctionStats>({
    queryKey: ['/api/admin/auction-stats'],
  });

  // Fetch recent auctions
  const { data: recentAuctions, isLoading: auctionsLoading } = useQuery<Auction[]>({
    queryKey: ['/api/admin/auctions/recent'],
  });

  // Fetch auction invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/admin/auction-invoices'],
  });

  // Fetch auction settings
  const { data: auctionSettings, isLoading: settingsLoading } = useQuery<AuctionSetting[]>({
    queryKey: ['/api/admin/auction-settings'],
  });

  // Update auction setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => {
      return apiRequest('PUT', '/api/admin/auction-settings', { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-settings'] });
      toast({
        title: "Setting Updated",
        description: "Auction setting updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      active: { variant: "default" as const, label: "Active" },
      ended: { variant: "outline" as const, label: "Ended" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (statsLoading || auctionsLoading || invoicesLoading || settingsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Gavel className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Auction Management</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Gavel className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Auction Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
            <BarChart3 className="h-3 w-3" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="auctions" className="flex items-center gap-2 text-xs">
            <Gavel className="h-3 w-3" />
            Auctions
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3 w-3" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Auctions</CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAuctions || 0}</div>
                <p className="text-xs text-muted-foreground">All time auctions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeAuctions || 0}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">From completed auctions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBids || 0}</div>
                <p className="text-xs text-muted-foreground">All bids placed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Bids/Auction</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgBidsPerAuction?.toFixed(1) || '0.0'}</div>
                <p className="text-xs text-muted-foreground">Average engagement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.conversionRate?.toFixed(1) || '0.0'}%</div>
                <p className="text-xs text-muted-foreground">Auctions with bids</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Auctions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Auctions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Bids</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Winner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAuctions?.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium">{auction.title}</TableCell>
                      <TableCell>{getStatusBadge(auction.status)}</TableCell>
                      <TableCell>{formatCurrency(auction.currentBid)}</TableCell>
                      <TableCell>{auction.totalBids}</TableCell>
                      <TableCell>{new Date(auction.endTime).toLocaleDateString()}</TableCell>
                      <TableCell>{auction.winnerName || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auctions Tab */}
        <TabsContent value="auctions">
          <Card>
            <CardHeader>
              <CardTitle>Auction Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Detailed auction management coming soon</p>
                <Button>
                  <Gavel className="h-4 w-4 mr-2" />
                  Create New Auction
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Auction Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Auction</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Winning Bid</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.auctionTitle}</TableCell>
                      <TableCell>{invoice.winnerName}</TableCell>
                      <TableCell>{formatCurrency(invoice.winningBidAmount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auction Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {auctionSettings?.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <Label htmlFor={setting.key}>{setting.label}</Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                  {setting.type === 'boolean' ? (
                    <Switch
                      id={setting.key}
                      checked={setting.value === 'true'}
                      onCheckedChange={(checked) => 
                        handleSettingUpdate(setting.key, checked.toString())
                      }
                    />
                  ) : setting.type === 'textarea' ? (
                    <Textarea
                      id={setting.key}
                      value={setting.value}
                      onChange={(e) => handleSettingUpdate(setting.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={setting.key}
                      type={setting.type === 'number' ? 'number' : 'text'}
                      value={setting.value}
                      onChange={(e) => handleSettingUpdate(setting.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Auction Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Advanced reporting features coming soon</p>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}