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
import { Menu } from "lucide-react";
import { AdminPageLoading } from "@/components/ui/loading";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
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
      console.log('Creating product with data:', productData);
      const res = await apiRequest("POST", "/api/admin/products", productData);
      const result = await res.json();
      console.log('Product creation result:', result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setAddDialogOpen(false);
      toast({
        title: "Product added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Product creation failed:', error);
      toast({
        title: "Failed to add product",
        description: error.message || "An error occurred while trying to add the product. Please try again.",
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
        title: "Product updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update product",
        description: "An error occurred while trying to update the product. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Product deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete product",
        description: "An error occurred while trying to delete the product. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update display order mutation
  const updateDisplayOrderMutation = useMutation({
    mutationFn: async ({ id, displayOrder }: { id: number; displayOrder: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, { displayOrder });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Display order updated",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update display order",
        description: "An error occurred while trying to update the display order. Please try again.",
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
  
  // Handle display order update
  const handleUpdateDisplayOrder = (id: number, displayOrder: number) => {
    if (displayOrder < 0) return; // Prevent negative order
    updateDisplayOrderMutation.mutate({ id, displayOrder });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <AdminPageLoading>
        <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      </AdminPageLoading>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="hidden md:block text-3xl font-bold mb-4 md:mb-0">
            {translations.admin.products.title}
          </h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <i className="fas fa-plus mr-2"></i>
                {translations.admin.products.add}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95%] max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 z-40 bg-white pb-4">
                <DialogTitle>{translations.admin.products.add}</DialogTitle>
                <DialogDescription>
                  Add a new product to the store. Please fill out all required fields.
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
            <CardTitle>Product List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Display Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell>
                            <img 
                              src={product.imageUrl} 
                              alt={product.title} 
                              className="w-14 h-14 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/100?text=Image+Not+Available";
                              }}
                            />
                          </TableCell>
                          <TableCell>C${product.price}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {categoryMap[product.category as keyof typeof categoryMap]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[product.status as keyof typeof statusColors]}>
                              {statusMap[product.status as keyof typeof statusMap]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="px-2 py-0 h-6"
                                onClick={() => handleUpdateDisplayOrder(product.id, (product.displayOrder || 0) - 1)}
                                disabled={(product.displayOrder || 0) <= 0 || updateDisplayOrderMutation.isPending}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">
                                {updateDisplayOrderMutation.isPending ? 
                                  <span className="animate-pulse">...</span> : 
                                  product.displayOrder || 0}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-2 py-0 h-6" 
                                onClick={() => handleUpdateDisplayOrder(product.id, (product.displayOrder || 0) + 1)}
                                disabled={updateDisplayOrderMutation.isPending}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
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
                
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="flex items-center p-4 border-b border-gray-100">
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-16 h-16 object-cover rounded mr-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/100?text=Image+Not+Available";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{product.title}</h3>
                          <p className="text-sm text-gray-500">C${product.price}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {categoryMap[product.category as keyof typeof categoryMap]}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${statusColors[product.status as keyof typeof statusColors]}`}>
                              {statusMap[product.status as keyof typeof statusMap]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x border-t border-gray-100">
                        <Button 
                          variant="ghost"
                          className="h-12 rounded-none text-sm text-blue-600"
                          onClick={() => handleEditClick(product)}
                        >
                          <i className="fas fa-edit mr-2"></i> Edit
                        </Button>
                        <Button 
                          variant="ghost"
                          className="h-12 rounded-none text-sm text-red-600"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <i className="fas fa-trash mr-2"></i> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No products in the store yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="w-[95%] max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 z-40 bg-white pb-4">
              <DialogTitle>{translations.admin.products.edit}</DialogTitle>
              <DialogDescription>
                Edit product details. Please fill out all required fields.
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
              <AlertDialogTitle>{translations.admin.products.delete}</AlertDialogTitle>
              <AlertDialogDescription>
                {translations.admin.products.confirmDelete}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} disabled={deleteProduct.isPending}>
                {deleteProduct.isPending ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </span>
                ) : (
                  "Yes, delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminProducts;