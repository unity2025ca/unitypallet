import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import translations from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import Sidebar from "@/components/admin/Sidebar";
import ProductForm from "@/components/admin/ProductForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryMap, statusMap } from "@shared/schema";

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  limited: "bg-amber-100 text-amber-800 border-amber-200",
  soldout: "bg-red-100 text-red-800 border-red-200",
};

const AdminProducts = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  // State for managing forms and dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      const res = await apiRequest("POST", "/api/admin/products", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setAddDialogOpen(false);
      toast({
        title: "تم إضافة المنتج بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "فشل إضافة المنتج",
        description: "حدث خطأ أثناء محاولة إضافة المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "تم تحديث المنتج بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "فشل تحديث المنتج",
        description: "حدث خطأ أثناء محاولة تحديث المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "تم حذف المنتج بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "فشل حذف المنتج",
        description: "حدث خطأ أثناء محاولة حذف المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });
  
  // Handle add product
  const handleAddProduct = (data: any) => {
    createProduct.mutate(data);
  };
  
  // Handle edit product
  const handleEditProduct = (data: any) => {
    if (selectedProduct) {
      updateProduct.mutate({ id: selectedProduct.id, data });
    }
  };
  
  // Handle delete product
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      deleteProduct.mutate(selectedProduct.id);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8 mr-64">
          <div className="flex justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 mr-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-tajawal">
            {translations.admin.products.title}
          </h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus ml-2"></i>
                {translations.admin.products.add}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-tajawal">{translations.admin.products.add}</DialogTitle>
                <DialogDescription>
                  أضف منتج جديد للمتجر. يرجى ملء جميع الحقول المطلوبة.
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                onSubmit={handleAddProduct} 
                isSubmitting={createProduct.isPending} 
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-tajawal">قائمة المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الصورة</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.titleAr}</TableCell>
                        <TableCell>
                          <img 
                            src={product.imageUrl} 
                            alt={product.titleAr} 
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/100?text=صورة+غير+متوفرة";
                            }}
                          />
                        </TableCell>
                        <TableCell>{product.price} ريال</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {categoryMap[product.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[product.status]}>
                            {statusMap[product.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(product)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">لا توجد منتجات في المتجر حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-tajawal">{translations.admin.products.edit}</DialogTitle>
              <DialogDescription>
                قم بتعديل بيانات المنتج. يرجى ملء جميع الحقول المطلوبة.
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <ProductForm 
                defaultValues={selectedProduct}
                onSubmit={handleEditProduct} 
                isSubmitting={updateProduct.isPending} 
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-tajawal">{translations.admin.products.delete}</AlertDialogTitle>
              <AlertDialogDescription>
                {translations.admin.products.confirmDelete}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse justify-start gap-2">
              <AlertDialogAction onClick={handleDeleteProduct} disabled={deleteProduct.isPending}>
                {deleteProduct.isPending ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    جارٍ الحذف...
                  </span>
                ) : (
                  "نعم، قم بالحذف"
                )}
              </AlertDialogAction>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminProducts;
