import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/Sidebar';
import { Loader2, Menu, Home } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import type { Setting } from '@shared/schema';
import SettingItem from '@/components/admin/SettingItem';
import { Separator } from '@/components/ui/separator';

export default function AdminHomepage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('banner');
  
  // Get all settings
  const { 
    allSettings, 
    getSettingsByCategory, 
    isLoading 
  } = useSettings();

  // Filter settings by homepage sections
  const bannerSettings = getSettingsByCategory('home_banner') || [];
  const featuresSettings = getSettingsByCategory('home_features') || [];
  const aboutSettings = getSettingsByCategory('home_about') || [];
  const productsSettings = getSettingsByCategory('home_products') || [];
  const ctaSettings = getSettingsByCategory('home_cta') || [];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-auto">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1 className="text-2xl font-bold">Homepage Settings</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu />
          </Button>
        </div>
        
        {/* Desktop Title */}
        <div className="hidden md:flex mb-6 items-center space-x-4">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Homepage Settings</h1>
        </div>
        
        <p className="text-slate-600 mb-6">
          Customize the content and images on your homepage. Changes will be visible to all visitors immediately.
        </p>
        
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <TabsList className="mb-4 md:mb-8 justify-start w-max min-w-full flex flex-nowrap">
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="banner">Hero Banner</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="features">Features</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="about">About Section</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="products">Products Section</TabsTrigger>
                <TabsTrigger className="whitespace-nowrap flex-shrink-0" value="cta">Call to Action</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="banner" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Configure the main banner that appears at the top of your homepage.</p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Banner Content</h3>
                  {bannerSettings
                    .filter(s => !s.key.includes('image'))
                    .map(setting => (
                      <SettingItem key={setting.id} setting={setting} />
                    ))}
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Banner Images</h3>
                  {bannerSettings
                    .filter(s => s.key.includes('image'))
                    .map(setting => (
                      <SettingItem key={setting.id} setting={setting} />
                    ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Configure the features section of your homepage.</p>
              
              <div className="border-b pb-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Section Header</h3>
                {featuresSettings
                  .filter(s => s.key.includes('title') || s.key.includes('subtitle'))
                  .map(setting => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {[1, 2, 3].map(featureNum => (
                    <Card key={featureNum} className="border shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-md">Feature {featureNum}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {featuresSettings
                          .filter(s => s.key.includes(`feature_${featureNum}`))
                          .map(setting => (
                            <SettingItem key={setting.id} setting={setting} />
                          ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Configure the about section on your homepage.</p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">About Content</h3>
                  {aboutSettings
                    .filter(s => !s.key.includes('image'))
                    .map(setting => (
                      <SettingItem key={setting.id} setting={setting} />
                    ))}
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">About Image</h3>
                  {aboutSettings
                    .filter(s => s.key.includes('image'))
                    .map(setting => (
                      <SettingItem key={setting.id} setting={setting} />
                    ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Configure the products section on your homepage.</p>
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Products Section Content</h3>
                {productsSettings.map(setting => (
                  <SettingItem key={setting.id} setting={setting} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="cta" className="space-y-4">
              <p className="text-slate-600 mb-4 md:mb-6">Configure the call-to-action section at the bottom of your homepage.</p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">CTA Content</h3>
                  {ctaSettings
                    .filter(s => !s.key.includes('image') && !s.key.includes('background'))
                    .map(setting => (
                      <SettingItem key={setting.id} setting={setting} />
                    ))}
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">CTA Background</h3>
                  {ctaSettings
                    .filter(s => s.key.includes('image') || s.key.includes('background'))
                    .map(setting => (
                      <SettingItem key={setting.id} setting={setting} />
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}