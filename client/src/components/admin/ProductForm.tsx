import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import translations from "@/lib/i18n";
import { categoryMap, insertProductSchema, statusMap, type Product, type ProductImage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Upload, Image, Loader2, XCircle, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Extend the product schema with validation rules
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number().min(1, "Price must be greater than zero"),
});

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (data: z.infer<typeof productFormSchema>) => void;
  isSubmitting: boolean;
}

const ProductForm = ({ defaultValues, onSubmit, isSubmitting }: ProductFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch additional product images if editing an existing product
  const productId = defaultValues?.id;
  const { data: productImages } = useQuery<ProductImage[]>({
    queryKey: [`/api/products/${productId}/images`],
    enabled: !!productId,
  });
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues || {
      title: "",
      titleAr: "", // Keep for database compatibility but hide from UI
      description: "",
      descriptionAr: "", // Keep for database compatibility but hide from UI
      category: "electronics",
      status: "available",
      price: 0,
      imageUrl: "",
    },
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // If we're editing an existing product and it has an ID, use the product-specific endpoint
      const productId = defaultValues?.id;
      const uploadUrl = productId 
        ? `/api/admin/products/${productId}/image` 
        : '/api/upload';
        
      // Upload the image
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update the form with the image URL
        form.setValue('imageUrl', result.fileUrl, { 
          shouldValidate: true, 
          shouldDirty: true 
        });
        
        toast({
          title: "Image uploaded successfully",
          description: "The image has been uploaded and linked to the product",
        });
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle additional image upload for existing products
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploadingAdditional(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('isMain', 'false');
      
      // Upload the additional image
      const response = await fetch(`/api/admin/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Additional image uploaded",
          description: "The image has been added to this product's gallery"
        });
        
        // Refresh product images using React Query
        // Instead of full page reload which loses state
        queryClient.invalidateQueries([`/api/products/${productId}/images`]);
      } else {
        throw new Error(result.message || 'Failed to upload additional image');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the additional image",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAdditional(false);
    }
  };
  
  // Set an image as the main image
  const setAsMainImage = async (imageId: number) => {
    if (!productId) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}/main`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to set main image');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Main image updated",
          description: "The selected image is now the main product image"
        });
        
        // Refresh product images using React Query
        queryClient.invalidateQueries([`/api/products/${productId}/images`]);
        // Also refresh the product details to update the main image
        queryClient.invalidateQueries([`/api/products/${productId}`]);
      } else {
        throw new Error(result.message || 'Failed to update main image');
      }
    } catch (error: any) {
      toast({
        title: "Failed to set main image",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Delete a product image
  const deleteProductImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Image deleted",
          description: "The image has been removed from this product"
        });
        
        // Refresh product images
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to delete image');
      }
    } catch (error: any) {
      toast({
        title: "Failed to delete image",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Trigger additional file input click
  const triggerAdditionalFileUpload = () => {
    additionalFileInputRef.current?.click();
  };

  // Handle form submission
  const handleSubmit = (data: z.infer<typeof productFormSchema>) => {
    // Copy English content to Arabic fields for database compatibility
    data.titleAr = data.title;
    data.descriptionAr = data.description;
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Hidden fields for Arabic compatibility */}
          <input type="hidden" {...form.register("titleAr")} />
          <input type="hidden" {...form.register("descriptionAr")} />
          
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translations.admin.products.form.category}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || 'electronics'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(categoryMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translations.admin.products.form.status}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || 'available'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(statusMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translations.admin.products.form.price}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Image URL with Upload */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>{translations.admin.products.form.imageUrl}</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    className="shrink-0 w-[100px]"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <FormDescription>
                  Enter a URL or upload an image (JPEG, PNG, GIF, WEBP, max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Preview */}
        {form.watch("imageUrl") && (
          <div className="border rounded-md p-4 mt-4">
            <p className="font-medium mb-2">Main Image Preview:</p>
            <img 
              src={form.watch("imageUrl")} 
              alt="Product preview" 
              className="w-full max-h-40 object-cover rounded" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
              }}
            />
          </div>
        )}
        
        {/* Additional Images Section (only for existing products) */}
        {productId && (
          <div className="border rounded-md p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Additional Product Images</h3>
              
              <div>
                <input 
                  type="file" 
                  ref={additionalFileInputRef}
                  onChange={handleAdditionalImageUpload}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={triggerAdditionalFileUpload}
                  disabled={isUploadingAdditional}
                  size="sm"
                >
                  {isUploadingAdditional ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploadingAdditional ? "Uploading..." : "Add Image"}
                </Button>
              </div>
            </div>
            
            {productImages && productImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {productImages.map((image) => (
                  <div key={image.id} className="relative group border rounded-md overflow-hidden">
                    <img 
                      src={image.imageUrl} 
                      alt={`Product image ${image.id}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/300x300?text=NA";
                      }}
                    />
                    
                    {/* Image controls overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {image.isMain ? (
                        <div className="px-2 py-1 bg-primary text-white rounded-md text-xs flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Main Image
                        </div>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setAsMainImage(image.id)}
                        >
                          Set as Main
                        </Button>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => deleteProductImage(image.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No additional images available</p>
                <p className="text-sm mt-2">Upload additional product images to enhance the product gallery</p>
              </div>
            )}
          </div>
        )}
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <i className="fas fa-spinner fa-spin"></i>
              Saving...
            </span>
          ) : (
            translations.admin.products.form.submit
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
