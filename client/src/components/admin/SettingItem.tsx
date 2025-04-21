import { useState } from "react";
import { Setting } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, XIcon } from "lucide-react";

interface SettingItemProps {
  setting: Setting;
}

export default function SettingItem({ setting }: SettingItemProps) {
  const [value, setValue] = useState(setting.value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsChanged(e.target.value !== setting.value);
  };

  const handleSubmit = async () => {
    if (!isChanged) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/settings/${setting.key}`, { value });
      
      // Invalidate settings cache
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث "${setting.label}" بنجاح.`,
      });
      
      setIsChanged(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء محاولة تحديث الإعداد.",
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
    } else if (setting.type === "url" && setting.key === "site_logo") {
      inputElement = (
        <div className="space-y-3">
          <Input 
            type="url"
            id={setting.key} 
            value={value} 
            onChange={handleInputChange}
            placeholder="https://example.com/logo.png"
          />
          {value && (
            <div className="flex justify-center p-2 bg-gray-50 rounded-md">
              <img src={value} alt="Logo Preview" className="h-12 object-contain" />
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