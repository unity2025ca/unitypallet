import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/admin/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit, Trash, MoveUp, MoveDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@shared/schema";

// Validation schema for category form
const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  displayOrder: z.number().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminCategories() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Create form
  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      slug: "",
      description: "",
      descriptionAr: "",
      displayOrder: 0,
    },
  });

  // Edit form
  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      slug: "",
      description: "",
      descriptionAr: "",
      displayOrder: 0,
    },
  });

  // Query to fetch all categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetch("/api/categories").then((res) => res.json()),
  });

  // Mutation to create a new category
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest("POST", "/api/admin/categories", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update a category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => {
      const response = await apiRequest("PUT", `/api/admin/categories/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update category");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/categories/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to handle create form submission
  const onCreateSubmit = (data: CategoryFormValues) => {
    createCategoryMutation.mutate(data);
  };

  // Function to handle edit form submission
  const onEditSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    }
  };

  // Function to open edit dialog and populate form
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    editForm.reset({
      name: category.name,
      nameAr: category.nameAr,
      slug: category.slug,
      description: category.description || "",
      descriptionAr: category.descriptionAr || "",
      displayOrder: category.displayOrder,
    });
    setIsEditDialogOpen(true);
  };

  // Function to confirm category deletion
  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Function to execute category deletion
  const confirmDeleteCategory = () => {
    if (deletingCategory) {
      deleteCategoryMutation.mutate(deletingCategory.id);
    }
  };
  
  // Function to move category up in display order
  const moveCategoryUp = async (category: Category) => {
    // Find the category just above this one
    if (!categories) return;
    
    const sortedCategories = [...categories].sort((a, b) => 
      (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if (currentIndex <= 0) return; // Already at the top
    
    const previousCategory = sortedCategories[currentIndex - 1];
    const newOrder = (previousCategory.displayOrder || 0) - 1;
    
    try {
      await apiRequest("PUT", `/api/admin/categories/${category.id}`, {
        ...category,
        displayOrder: newOrder
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category order updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive"
      });
    }
  };
  
  // Function to move category down in display order
  const moveCategoryDown = async (category: Category) => {
    if (!categories) return;
    
    const sortedCategories = [...categories].sort((a, b) => 
      (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if (currentIndex >= sortedCategories.length - 1) return; // Already at the bottom
    
    const nextCategory = sortedCategories[currentIndex + 1];
    const newOrder = (nextCategory.displayOrder || 0) + 1;
    
    try {
      await apiRequest("PUT", `/api/admin/categories/${category.id}`, {
        ...category,
        displayOrder: newOrder
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category order updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <Redirect to="/admin/login" />;
  }
  
  const sortedCategories = categories ? 
    [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : 
    [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Categories</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Manage product categories for your store. Categories are used to organize products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No categories found. Create your first category.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Name (Arabic)</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.nameAr}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.slug}</Badge>
                        </TableCell>
                        <TableCell>{category.displayOrder}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => moveCategoryUp(category)}
                              title="Move Up"
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => moveCategoryDown(category)}
                              title="Move Down"
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteCategory(category)}
                              className="text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
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
      </div>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your products. Fill out the form below.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Electronics" />
                    </FormControl>
                    <FormDescription>The category name in English</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., الإلكترونيات" />
                    </FormControl>
                    <FormDescription>The category name in Arabic</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., electronics" />
                    </FormControl>
                    <FormDescription>URL-friendly name (leave empty to generate automatically)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description in English..." />
                    </FormControl>
                    <FormDescription>Optional description of the category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف الفئة بالعربية..." />
                    </FormControl>
                    <FormDescription>Optional description in Arabic</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>Order in which to display this category (lower numbers first)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information. Fill out the form below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Electronics" />
                    </FormControl>
                    <FormDescription>The category name in English</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., الإلكترونيات" />
                    </FormControl>
                    <FormDescription>The category name in Arabic</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., electronics" />
                    </FormControl>
                    <FormDescription>URL-friendly name (leave empty to generate automatically)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description in English..." />
                    </FormControl>
                    <FormDescription>Optional description of the category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف الفئة بالعربية..." />
                    </FormControl>
                    <FormDescription>Optional description in Arabic</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>Order in which to display this category (lower numbers first)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCategoryMutation.isPending}
                >
                  {updateCategoryMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category 
              "{deletingCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}