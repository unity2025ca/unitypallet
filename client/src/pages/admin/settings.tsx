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
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/admin/Sidebar";
import SettingItem from "@/components/admin/SettingItem";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { type Setting } from "@shared/schema";

export default function AdminSettings() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("appearance");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-auto">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu />
          </Button>
        </div>
        
        {/* Desktop Title */}
        <div className="hidden md:flex mb-6 items-center space-x-4">
          <Settings2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Website Settings</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-4 md:mb-8 justify-start">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="appearance" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify the site appearance, colors and logo</p>
              {appearanceSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify site content, headings and descriptions</p>
              {contentSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify contact information</p>
              {contactSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify social media accounts</p>
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