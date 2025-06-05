import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Menu,
  Database,
  Download,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from "@/components/admin/Sidebar";
import SettingItem from "@/components/admin/SettingItem";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Setting } from "@shared/schema";

export default function AdminSettings() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("backup");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });

  // Backup status query
  const { data: backupStatus, refetch: refetchBackupStatus } = useQuery({
    queryKey: ["/api/admin/backup/status"],
    enabled: isAuthenticated && isAdmin,
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/backup/create");
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Backup Created Successfully",
          description: result.message,
          variant: "default",
        });
        refetchBackupStatus();
      } else {
        toast({
          title: "Backup Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Backup Error",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    },
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
  const aboutSettings = settings?.filter(s => s.category === "about") || [];
  const howItWorksSettings = settings?.filter(s => s.category === "how_it_works") || [];
  const systemSettings = settings?.filter(s => s.category === "system") || [];
  const appointmentsSettings = settings?.filter(s => s.category === "appointments") || [];
  
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
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <TabsList className="mb-4 md:mb-8 justify-start w-max min-w-full flex flex-nowrap">
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="backup">Backup</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="system">System</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="appointments">Appointments</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="appearance">Appearance</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="content">Content</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="about">About Us</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="how_it_works">How It Works</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="contact">Contact Info</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="social">Social Media</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="system" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Manage system settings and maintenance mode</p>
              {systemSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Configure appointment settings and availability</p>
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Appointment Visibility</h3>
                {appointmentsSettings
                  .filter(s => s.key.includes('show_appointments'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
              
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Appointment Days and Hours</h3>
                {appointmentsSettings
                  .filter(s => s.key.includes('days') || s.key.includes('time') || s.key.includes('interval'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
            </TabsContent>
            
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
            
            <TabsContent value="about" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify About Us page content and info</p>
              {aboutSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify social media accounts</p>
              {socialSettings.map(setting => (
                <SettingItem key={setting.id} setting={setting} />
              ))}
            </TabsContent>
            
            <TabsContent value="how_it_works" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Modify 'How It Works' page content and steps</p>
              
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Page Header</h3>
                {howItWorksSettings
                  .filter(s => !s.key.includes('step') && !s.key.includes('type') && !s.key.includes('explanation'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
              
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Purchase Steps</h3>
                {howItWorksSettings
                  .filter(s => s.key.includes('step'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
              
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Explanation Section</h3>
                {howItWorksSettings
                  .filter(s => s.key.includes('explanation'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Types</h3>
                {howItWorksSettings
                  .filter(s => s.key.includes('type'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}