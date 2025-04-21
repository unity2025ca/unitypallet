import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
          
          {/* Image URL */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translations.admin.products.form.imageUrl}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
