import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Clock, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  title: string;
  titleAr: string;
  price: number;
}

interface Auction {
  id: number;
  productId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  startingPrice: number;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  status: "draft" | "active" | "ended" | "cancelled";
  winnerId: number | null;
  totalBids: number;
  isAutoExtend: boolean;
  autoExtendMinutes: number;
  createdAt: string;
  productTitle: string;
  productTitleAr: string;
  productPrice: number;
  productImage: string;
}

function AuctionForm({ auction, onClose }: { auction?: Auction; onClose: () => void }) {
  const [formData, setFormData] = useState({
    productId: auction?.productId || 0,
    title: auction?.title || "",
    titleAr: auction?.titleAr || "",
    description: auction?.description || "",
    descriptionAr: auction?.descriptionAr || "",
    startingPrice: auction ? auction.startingPrice / 100 : 0,
    reservePrice: auction && auction.reservePrice ? auction.reservePrice / 100 : 0,
    bidIncrement: auction ? auction.bidIncrement / 100 : 5,
    startTime: auction?.startTime ? new Date(auction.startTime).toISOString().slice(0, 16) : "",
    endTime: auction?.endTime ? new Date(auction.endTime).toISOString().slice(0, 16) : "",
    status: auction?.status || "draft",
    isAutoExtend: auction?.isAutoExtend ?? true,
    autoExtendMinutes: auction?.autoExtendMinutes || 5,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        startingPrice: Math.round(data.startingPrice * 100),
        reservePrice: data.reservePrice ? Math.round(data.reservePrice * 100) : null,
        bidIncrement: Math.round(data.bidIncrement * 100),
      };

      if (auction) {
        return apiRequest(`/api/auctions/${auction.id}`, "PUT", payload);
      } else {
        return apiRequest("/api/auctions", "POST", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: auction ? "تم تحديث المزاد" : "تم إنشاء المزاد",
        description: "تم حفظ التغييرات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ المزاد",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productId">المنتج</Label>
          <Select
            value={formData.productId.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, productId: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المنتج" />
            </SelectTrigger>
            <SelectContent>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.titleAr || product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="ended">منتهي</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">العنوان (إنجليزي)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="titleAr">العنوان (عربي)</Label>
          <Input
            id="titleAr"
            value={formData.titleAr}
            onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="description">الوصف (إنجليزي)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
          <Textarea
            id="descriptionAr"
            value={formData.descriptionAr}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startingPrice">سعر البداية ($)</Label>
          <Input
            id="startingPrice"
            type="number"
            step="0.01"
            value={formData.startingPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="reservePrice">السعر الاحتياطي ($)</Label>
          <Input
            id="reservePrice"
            type="number"
            step="0.01"
            value={formData.reservePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, reservePrice: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="bidIncrement">زيادة المزايدة ($)</Label>
          <Input
            id="bidIncrement"
            type="number"
            step="0.01"
            value={formData.bidIncrement}
            onChange={(e) => setFormData(prev => ({ ...prev, bidIncrement: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">وقت البداية</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">وقت النهاية</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isAutoExtend}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAutoExtend: checked }))}
        />
        <Label>تمديد تلقائي عند المزايدة في النهاية</Label>
        {formData.isAutoExtend && (
          <Input
            type="number"
            className="w-20"
            value={formData.autoExtendMinutes}
            onChange={(e) => setFormData(prev => ({ ...prev, autoExtendMinutes: parseInt(e.target.value) || 5 }))}
            min="1"
            max="60"
          />
        )}
        <span className="text-sm text-muted-foreground">دقيقة</span>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "جاري الحفظ..." : auction ? "تحديث" : "إنشاء"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminAuctionsPage() {
  const [selectedAuction, setSelectedAuction] = useState<Auction | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions", { status: "all" }],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/auctions/${id}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "تم حذف المزاد",
        description: "تم حذف المزاد بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المزاد",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      active: "default",
      ended: "outline",
      cancelled: "destructive",
    } as const;

    const labels = {
      draft: "مسودة",
      active: "نشط",
      ended: "منتهي",
      cancelled: "ملغي",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return "انتهت";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} يوم`;
    return `${hours} ساعة`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المزادات</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedAuction(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة مزاد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAuction ? "تعديل المزاد" : "إضافة مزاد جديد"}
              </DialogTitle>
            </DialogHeader>
            <AuctionForm
              auction={selectedAuction}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Auctions</p>
                <p className="text-2xl font-bold">{auctions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Auctions</p>
                <p className="text-2xl font-bold">
                  {auctions?.filter(a => a.status === "active").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold">
                  {auctions?.reduce((sum, a) => sum + a.totalBids, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    auctions?.reduce((sum, a) => sum + (a.currentBid || a.startingPrice), 0) || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auctions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Auctions List</CardTitle>
        </CardHeader>
        <CardContent>
          {!auctions || auctions.length === 0 ? (
            <div className="text-center py-8">
              <Gavel className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Auctions</h3>
              <p className="text-muted-foreground">
                Start by creating a new auction
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={auction.productImage || "/placeholder.jpg"}
                          alt="Product"
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">
                          {auction.productTitle}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {auction.title}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(auction.status)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(auction.currentBid || auction.startingPrice)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{auction.totalBids}</span>
                    </TableCell>
                    <TableCell>
                      {auction.status === "active" ? formatTimeLeft(auction.endTime) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAuction(auction);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(auction.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}