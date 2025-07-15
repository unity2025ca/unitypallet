import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement, InsertAdvertisement } from "@shared/schema";

interface AdvertisementFormData {
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdvertisementsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdvertisement, setEditingAdvertisement] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdvertisementFormData>({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    position: "homepage",
    isActive: true,
    displayOrder: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: advertisements = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/admin/advertisements"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertAdvertisement) => apiRequest("POST", "/api/admin/advertisements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Advertisement created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create advertisement",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertAdvertisement> }) => 
      apiRequest("PUT", `/api/admin/advertisements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Advertisement updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update advertisement",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/advertisements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete advertisement",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      imageUrl: "",
      linkUrl: "",
      position: "homepage",
      isActive: true,
      displayOrder: 0
    });
    setEditingAdvertisement(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAdvertisement) {
      updateMutation.mutate({
        id: editingAdvertisement.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (advertisement: Advertisement) => {
    setEditingAdvertisement(advertisement);
    setFormData({
      title: advertisement.title,
      content: advertisement.content || "",
      imageUrl: advertisement.imageUrl || "",
      linkUrl: advertisement.linkUrl || "",
      position: advertisement.position,
      isActive: advertisement.isActive,
      displayOrder: advertisement.displayOrder
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewAdvertisement = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advertisement Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewAdvertisement} style={{ backgroundColor: '#dc2626' }}>
              <Plus className="w-4 h-4 mr-2" />
              New Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAdvertisement ? "Edit Advertisement" : "Create New Advertisement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Advertisement title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="products">Products Page</SelectItem>
                      <SelectItem value="checkout">Checkout Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Advertisement content/description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/products or https://example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {editingAdvertisement ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {advertisements.map((advertisement) => (
          <Card key={advertisement.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {advertisement.title}
                    {advertisement.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>Position: {advertisement.position}</span>
                    <span>Order: {advertisement.displayOrder}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(advertisement)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(advertisement.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {advertisement.imageUrl && (
                  <div className="md:col-span-1">
                    <img 
                      src={advertisement.imageUrl} 
                      alt={advertisement.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
                <div className={advertisement.imageUrl ? "md:col-span-2" : "md:col-span-3"}>
                  {advertisement.content && (
                    <p className="text-gray-700 mb-2">{advertisement.content}</p>
                  )}
                  {advertisement.linkUrl && (
                    <p className="text-sm text-blue-600">
                      <strong>Link:</strong> {advertisement.linkUrl}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(advertisement.createdAt).toLocaleDateString()}
                    {advertisement.updatedAt && advertisement.updatedAt !== advertisement.createdAt && (
                      <span> | Updated: {new Date(advertisement.updatedAt).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {advertisements.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No advertisements created yet.</p>
              <Button 
                onClick={handleNewAdvertisement}
                className="mt-4"
                style={{ backgroundColor: '#dc2626' }}
              >
                Create Your First Advertisement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}