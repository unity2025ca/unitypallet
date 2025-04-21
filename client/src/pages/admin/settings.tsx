import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Loader2,
  Settings2,
} from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import SettingItem from "@/components/admin/SettingItem";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { type Setting } from "@shared/schema";

export default function AdminSettings() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("appearance");
  
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });
  
  // Show loading state
  if (authLoading || isLoading) {
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
  
  // Filter settings by category
  const appearanceSettings = settings?.filter(s => s.category === "appearance") || [];
  const contentSettings = settings?.filter(s => s.category === "content") || [];
  const contactSettings = settings?.filter(s => s.category === "contact") || [];
  const socialSettings = settings?.filter(s => s.category === "social") || [];
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center space-x-4 space-x-reverse">
          <Settings2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold rtl-dir">إعدادات الموقع</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 justify-start rtl-dir">
              <TabsTrigger value="appearance">المظهر</TabsTrigger>
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
              <TabsTrigger value="social">مواقع التواصل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-4">
              <p className="text-slate-600 mb-6 rtl-dir">تعديل مظهر الموقع، الألوان والشعار</p>
              {appearanceSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <p className="text-slate-600 mb-6 rtl-dir">تعديل محتوى الموقع، العناوين والأوصاف</p>
              {contentSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <p className="text-slate-600 mb-6 rtl-dir">تعديل معلومات الاتصال بالموقع</p>
              {contactSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <p className="text-slate-600 mb-6 rtl-dir">تعديل حسابات مواقع التواصل الاجتماعي</p>
              {socialSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}