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
import { Upload, Image, Loader2, XCircle, Check, Play } from "lucide-react";
import MediaGallery from "./MediaGallery";
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
  displayOrder: z.coerce.number().int().default(0),
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
      displayOrder: 0,
    },
  });

  // Handle image or video upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type (images and videos)
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image or video file (JPEG, PNG, GIF, WEBP, MP4, AVI, MOV, WMV, WEBM, MKV)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File must be less than 500MB",
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
        // Check where the image URL is in the response
        let imageUrl = result.fileUrl;
        
        // For product images, the response is different
        if (!imageUrl && result.image && result.image.imageUrl) {
          imageUrl = result.image.imageUrl;
        }
        
        console.log('Image URL from server:', imageUrl);
        
        // Update the form with the image URL
        form.setValue('imageUrl', imageUrl, { 
          shouldValidate: true, 
          shouldDirty: true 
        });
        
        const isVideo = file.type.startsWith('video/');
        toast({
          title: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
          description: `The ${isVideo ? 'video' : 'image'} has been uploaded and linked to the product`,
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
  
  // Handle additional image or video upload for existing products
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    
    // Validate file type (images and videos)
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image or video file (JPEG, PNG, GIF, WEBP, MP4, AVI, MOV, WMV, WEBM, MKV)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File must be less than 500MB",
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
        const isVideo = file.type.startsWith('video/');
        toast({
          title: `Additional ${isVideo ? 'video' : 'image'} uploaded`,
          description: `The ${isVideo ? 'video' : 'image'} has been added to this product's gallery`
        });
        
        // Refresh product images using React Query
        // Instead of full page reload which loses state
        queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/images`] });
      } else {
        throw new Error(result.message || 'Failed to upload additional media');
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
        queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/images`] });
        // Also refresh the product details to update the main image
        queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
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
        
        // Refresh product images using React Query
        queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/images`] });
        // Also refresh the product details in case it was a main image
        queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 relative pb-16">
        {/* Fixed Submit Button at the top */}
        <div className="sticky top-0 z-50 bg-white p-4 border-b flex justify-between items-center mb-4 shadow-md">
          <h3 className="font-medium">Product Details</h3>
          <Button 
            type="submit" 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              translations.admin.products.form.submit
            )}
          </Button>
        </div>

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
          
          {/* Display Order */}
          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormDescription>
                  Products with lower numbers will be displayed first
                </FormDescription>
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
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/avi,video/mov,video/wmv,video/webm,video/mkv"
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
                  Enter a URL or upload an image/video (JPEG, PNG, GIF, WEBP, MP4, AVI, MOV, WMV, WEBM, MKV, max 500MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Preview */}
        {form.watch("imageUrl") && (
          <div className="border rounded-md p-4 mt-4">
            <p className="font-medium mb-2">Main Media Preview:</p>
            {form.watch("imageUrl")?.includes('/video/') || form.watch("imageUrl")?.match(/\.(mp4|avi|mov|wmv|webm|mkv)$/i) ? (
              <video 
                src={form.watch("imageUrl")} 
                className="w-full max-h-40 object-cover rounded" 
                controls
                onError={(e) => {
                  (e.target as HTMLVideoElement).poster = "https://placehold.co/600x400?text=Video+Not+Available";
                }}
              />
            ) : (
              <img 
                src={form.watch("imageUrl")} 
                alt="Product preview" 
                className="w-full max-h-40 object-cover rounded" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
                }}
              />
            )}
          </div>
        )}
        
        {/* Additional Media Section (only for existing products) */}
        {productId && (
          <div className="border rounded-md p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Additional Product Media</h3>
              
              <div>
                <input 
                  type="file" 
                  ref={additionalFileInputRef}
                  onChange={handleAdditionalImageUpload}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/avi,video/mov,video/wmv,video/webm,video/mkv"
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
                  {isUploadingAdditional ? "Uploading..." : "Add Media"}
                </Button>
              </div>
            </div>
            
            <MediaGallery
              productImages={productImages || []}
              onSetMainImage={setAsMainImage}
              onDeleteImage={deleteProductImage}
            />
          </div>
        )}
        
        {/* No bottom submit button needed since we have the sticky one at the top */}
      </form>
    </Form>
  );
};

export default ProductForm;
