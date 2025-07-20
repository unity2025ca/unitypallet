import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Users, Activity, Settings, Pause, Play, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface AutoBid {
  id: number;
  auctionId: number;
  auctionTitle: string;
  userId: number;
  username: string;
  maxBidAmount: number;
  currentBidAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AutoBidStats {
  totalAutoBids: number;
  activeAutoBids: number;
  totalUsers: number;
  successfulBids: number;
}

export default function AutoBiddingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingAutoBid, setEditingAutoBid] = useState<AutoBid | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    auctionId: '',
    userId: '',
    maxBidAmount: '',
  });

  // Fetch auto-bidding statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AutoBidStats>({
    queryKey: ['/api/admin/auto-bidding/stats'],
  });

  // Fetch auto bids
  const { data: autoBids, isLoading: autoBidsLoading } = useQuery<AutoBid[]>({
    queryKey: ['/api/admin/auto-bidding'],
  });

  // Toggle auto bid status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/admin/auto-bidding/${id}/toggle`, 'PATCH', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auto-bidding'] });
      toast({
        title: "Status Updated",
        description: "Auto-bid status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update auto-bid status",
        variant: "destructive",
      });
    },
  });

  // Delete auto bid
  const deleteAutoBidMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/auto-bidding/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auto-bidding'] });
      toast({
        title: "Auto-Bid Deleted",
        description: "Auto-bid removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete auto-bid",
        variant: "destructive",
      });
    },
  });

  // Create auto bid
  const createAutoBidMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('/api/admin/auto-bidding', 'POST', {
        ...data,
        maxBidAmount: Math.round(parseFloat(data.maxBidAmount) * 100), // Convert to cents
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auto-bidding'] });
      setShowCreateDialog(false);
      setFormData({ auctionId: '', userId: '', maxBidAmount: '' });
      toast({
        title: "Auto-Bid Created",
        description: "Auto-bid created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create auto-bid",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Paused"}
      </Badge>
    );
  };

  const handleCreateAutoBid = () => {
    if (!formData.auctionId || !formData.userId || !formData.maxBidAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createAutoBidMutation.mutate(formData);
  };

  if (statsLoading || autoBidsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Auto-Bidding Management</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Auto-Bidding Management</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Auto-Bids</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAutoBids || 0}</div>
            <p className="text-xs text-muted-foreground">All time auto-bids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auto-Bids</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAutoBids || 0}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Using auto-bidding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Bids</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successfulBids || 0}</div>
            <p className="text-xs text-muted-foreground">Winning auto-bids</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Bids Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Auto-Bidding Rules</CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Bot className="h-4 w-4 mr-2" />
                Create Auto-Bid
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Auto-Bid Rule</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="auctionId">Auction ID</Label>
                  <Input
                    id="auctionId"
                    type="number"
                    value={formData.auctionId}
                    onChange={(e) => setFormData({ ...formData, auctionId: e.target.value })}
                    placeholder="Enter auction ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Enter user ID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxBidAmount">Maximum Bid Amount</Label>
                  <Input
                    id="maxBidAmount"
                    type="number"
                    step="0.01"
                    value={formData.maxBidAmount}
                    onChange={(e) => setFormData({ ...formData, maxBidAmount: e.target.value })}
                    placeholder="Enter maximum bid amount"
                  />
                </div>
                <Button 
                  onClick={handleCreateAutoBid}
                  disabled={createAutoBidMutation.isPending}
                >
                  {createAutoBidMutation.isPending ? "Creating..." : "Create Auto-Bid"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auction</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Max Bid</TableHead>
                <TableHead>Current Bid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {autoBids?.map((autoBid) => (
                <TableRow key={autoBid.id}>
                  <TableCell className="font-medium">{autoBid.auctionTitle}</TableCell>
                  <TableCell>{autoBid.username}</TableCell>
                  <TableCell>{formatCurrency(autoBid.maxBidAmount)}</TableCell>
                  <TableCell>{formatCurrency(autoBid.currentBidAmount)}</TableCell>
                  <TableCell>{getStatusBadge(autoBid.isActive)}</TableCell>
                  <TableCell>{new Date(autoBid.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatusMutation.mutate({
                          id: autoBid.id,
                          isActive: !autoBid.isActive
                        })}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {autoBid.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAutoBidMutation.mutate(autoBid.id)}
                        disabled={deleteAutoBidMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {autoBids?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No auto-bidding rules found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}