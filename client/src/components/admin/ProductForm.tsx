import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import translations from "@/lib/i18n";
import { categoryMap, insertProductSchema, statusMap, type Product } from "@shared/schema";
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
import { Upload, Image, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
            <p className="font-medium mb-2">Image Preview:</p>
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
