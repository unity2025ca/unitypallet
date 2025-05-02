import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Settings2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SettingItem from "@/components/admin/SettingItem";
import { type Setting } from "@shared/schema";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("appearance");
  
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });
  
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
    <AdminLayout title="Website Settings" requireAdmin>
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <TabsList className="mb-4 md:mb-8 justify-start w-max min-w-full flex flex-nowrap">
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
    </AdminLayout>
  );
}