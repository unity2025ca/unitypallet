import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Check, 
  X, 
  Loader2,
  Edit 
} from "lucide-react";
import { Setting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SettingItemProps {
  setting: Setting;
}

export default function SettingItem({ setting }: SettingItemProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(setting.value);

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest("PUT", `/api/admin/settings/${key}`, { value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${setting.key}`] });
      toast({
        title: "تم التحديث",
        description: `تم تحديث "${setting.label}" بنجاح`,
      });
      setEditing(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ key: setting.key, value });
  };

  const handleCancel = () => {
    setValue(setting.value);
    setEditing(false);
  };

  const renderInput = () => {
    if (!editing) {
      if (setting.type === "image") {
        return (
          <div className="flex items-center space-x-4 space-x-reverse">
            <img 
              src={setting.value} 
              alt={setting.label} 
              className="w-16 h-16 object-contain"
            />
            <div className="text-slate-600 rtl-dir">{setting.value}</div>
          </div>
        );
      }
      
      if (setting.type === "color") {
        return (
          <div className="flex items-center space-x-4 space-x-reverse">
            <div 
              className="w-6 h-6 rounded-full border" 
              style={{ backgroundColor: setting.value }}
            />
            <div className="text-slate-600 rtl-dir">{setting.value}</div>
          </div>
        );
      }
      
      if (setting.type === "textarea") {
        return <div className="text-slate-600 rtl-dir whitespace-pre-wrap">{setting.value}</div>;
      }
      
      return <div className="text-slate-600 rtl-dir">{setting.value}</div>;
    }

    switch (setting.type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`أدخل ${setting.label}`}
            className="rtl-dir"
            rows={4}
          />
        );
      case "color":
        return (
          <div className="flex space-x-4 space-x-reverse">
            <Input
              type="color"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`أدخل ${setting.label}`}
              className="rtl-dir"
            />
          </div>
        );
      case "image":
      case "text":
      case "email":
      case "tel":
      default:
        return (
          <Input
            type={setting.type === "email" ? "email" : setting.type === "tel" ? "tel" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`أدخل ${setting.label}`}
            className="rtl-dir"
          />
        );
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <Label className="font-bold text-lg rtl-dir">{setting.label}</Label>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          )}
        </div>
        {renderInput()}
      </CardContent>
      {editing && (
        <CardFooter className="flex justify-end space-x-2 space-x-reverse border-t pt-4">
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            size="sm"
            disabled={updateMutation.isPending}
          >
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button 
            onClick={handleSave} 
            size="sm"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 ml-2" />
            )}
            حفظ
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}