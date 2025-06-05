import { useState, useRef } from "react";
import { Setting } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, XIcon, AlertOctagon, Upload, Loader2 } from "lucide-react";

interface SettingItemProps {
  setting: Setting;
}

export default function SettingItem({ setting }: SettingItemProps) {
  const [value, setValue] = useState(setting.value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsChanged(e.target.value !== setting.value);
  };

  const handleSwitchChange = (checked: boolean) => {
    const newValue = checked ? "true" : "false";
    setValue(newValue);
    setIsChanged(newValue !== setting.value);
  };

  const handleSubmit = async () => {
    if (!isChanged) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/settings/${setting.key}`, { value });
      
      // Invalidate settings cache
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      toast({
        title: "Updated Successfully",
        description: `"${setting.label}" has been updated successfully.`,
      });
      
      setIsChanged(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the setting.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setValue(setting.value);
    setIsChanged(false);
  };
  
  // Function to handle image upload for any image setting
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, WEBP, SVG)",
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
      
      // Create FormData object
      const formData = new FormData();
      
      // Determine if this is a logo upload or a general image upload
      const isLogoUpload = setting.key === "site_logo";
      
      // Use the appropriate field name in the FormData
      if (isLogoUpload) {
        formData.append('logo', file);
      } else {
        formData.append('image', file);
        formData.append('settingKey', setting.key); // Pass the setting key to identify which setting to update
      }
      
      // Choose the correct endpoint based on upload type
      const uploadEndpoint = isLogoUpload 
        ? '/api/settings/upload-logo' 
        : '/api/settings/upload-image';
      
      // Upload the image
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${isLogoUpload ? 'logo' : 'image'}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update value with the new URL
        const imageUrl = isLogoUpload ? result.logoUrl : result.imageUrl;
        setValue(imageUrl);
        setIsChanged(imageUrl !== setting.value);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast({
          title: `${isLogoUpload ? "Logo" : "Image"} uploaded successfully`,
          description: `The ${setting.label.toLowerCase()} has been updated successfully`,
        });
        
        // Update the cache
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: `Failed to upload ${setting.key === "site_logo" ? "logo" : "image"}`,
        description: error.message || `An error occurred while uploading the ${setting.label.toLowerCase()}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Render different inputs based on setting type
  const renderInput = () => {
    // Default input is text
    let inputElement = (
      <Input 
        id={setting.key} 
        value={value} 
        onChange={handleInputChange}
      />
    );

    // Handle different types
    if (setting.type === "color") {
      inputElement = (
        <div className="flex space-x-2">
          <Input 
            type="color"
            id={setting.key} 
            value={value} 
            onChange={handleInputChange}
            className="w-16 h-10 p-1"
          />
          <Input 
            type="text"
            value={value} 
            onChange={handleInputChange}
            className="flex-1"
          />
        </div>
      );
    } else if (setting.type === "url" || setting.type === "image") {
      // Check if this is an image setting
      const isImage = setting.type === "image" || 
                      setting.key === "site_logo" || 
                      setting.key.includes("image") || 
                      setting.key.includes("background");
                      
      const isLogoUpload = setting.key === "site_logo";
      
      inputElement = (
        <div className="space-y-4">
          <div className="space-y-3">
            <Input 
              type="url"
              id={setting.key} 
              value={value} 
              onChange={handleInputChange}
              placeholder={isImage ? "https://example.com/image.jpg" : "https://example.com/"}
            />
            {value && isImage && (
              <div className="flex justify-center p-2 bg-gray-50 rounded-md">
                <img 
                  src={value} 
                  alt={`${setting.label} Preview`} 
                  className={isLogoUpload ? "h-12 object-contain" : "max-h-32 object-contain"} 
                />
              </div>
            )}
          </div>
          
          {/* Add file upload section for all image fields */}
          {isImage && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                Or upload a new {isLogoUpload ? "logo" : "image"} directly:
              </div>
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  id={`${setting.key}-upload`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? "Uploading..." : `Upload ${isLogoUpload ? "Logo" : "Image"}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    } else if (setting.type === "textarea") {
      inputElement = (
        <textarea
          id={setting.key}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsChanged(e.target.value !== setting.value);
          }}
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2"
        />
      );
    } else if (setting.type === "boolean") {
      // For the maintenance mode, show a special warning UI
      if (setting.key === "maintenance_mode") {
        inputElement = (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id={setting.key}
                checked={value === "true"}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor={setting.key}>
                {value === "true" ? "Enabled" : "Disabled"}
              </Label>
            </div>
            
            {value === "true" && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-center">
                <AlertOctagon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-800">
                  Warning: When enabled, all purchasing functionality will be disabled on the website.
                  Customers will not be able to add items to cart or checkout.
                </span>
              </div>
            )}
          </div>
        );
      } else {
        // For other boolean settings
        inputElement = (
          <div className="flex items-center space-x-2">
            <Switch 
              id={setting.key}
              checked={value === "true"}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor={setting.key}>
              {value === "true" ? "Enabled" : "Disabled"}
            </Label>
          </div>
        );
      }
    }

    return inputElement;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <Label htmlFor={setting.key} className="text-lg font-medium block mb-1">
              {setting.label}
            </Label>
            {setting.category && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {setting.category}
              </span>
            )}
          </div>
          
          {setting.description && (
            <p className="text-sm text-gray-500 mb-4">{setting.description}</p>
          )}
          
          {renderInput()}
        </div>
      </CardContent>
      
      {isChanged && (
        <CardFooter className="px-6 py-4 bg-gray-50 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <XIcon className="mr-1 h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <CheckIcon className="mr-1 h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}