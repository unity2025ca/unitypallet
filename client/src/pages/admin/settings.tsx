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

  // Backup scheduler status query
  const { data: schedulerStatus } = useQuery({
    queryKey: ["/api/admin/backup/scheduler"],
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
            
            <TabsContent value="backup" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Database Backup</h2>
                <p className="text-slate-600">Create and manage database backups to secure your website data</p>
              </div>

              <div className="grid gap-6">
                {/* Backup Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Backup Status
                    </CardTitle>
                    <CardDescription>
                      Current status of your backup system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {backupStatus?.available ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Backup system is ready and configured properly.
                          {backupStatus?.lastBackup && (
                            <span className="block mt-1 text-sm text-muted-foreground">
                              Last backup: {new Date(backupStatus.lastBackup).toLocaleString()}
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Backup system is not configured. Please set up NEW_DATABASE_URL environment variable.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Create Backup Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Create New Backup
                    </CardTitle>
                    <CardDescription>
                      Save all your website data to the backup database
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This will backup all users, products, images, settings, orders, and other important data 
                        to your configured backup database.
                      </p>
                      <Button 
                        onClick={() => createBackupMutation.mutate()}
                        disabled={createBackupMutation.isPending || !backupStatus?.available}
                        className="w-full md:w-auto"
                      >
                        {createBackupMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Backup...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Create Backup Now
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Automatic Backup Schedule Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Automatic Backup Schedule
                    </CardTitle>
                    <CardDescription>
                      Daily automatic backups run at 2:00 AM Toronto time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Schedule Details</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Runs daily at 2:00 AM (Toronto time)</li>
                            <li>• Automatically backs up all data</li>
                            <li>• No manual intervention required</li>
                            <li>• Verification reports included</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Status</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Automatic backup scheduler active</span>
                            </div>
                            {schedulerStatus?.nextRun && (
                              <div className="text-muted-foreground">
                                Next backup: {schedulerStatus.nextRun}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Backup Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>What Gets Backed Up</CardTitle>
                    <CardDescription>
                      Complete list of data included in your backup
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium">Core Data</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• All user accounts and permissions</li>
                          <li>• Products and their details</li>
                          <li>• Product images and media</li>
                          <li>• Website settings and configuration</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Business Data</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Customer orders and history</li>
                          <li>• Contact form submissions</li>
                          <li>• Appointments and bookings</li>
                          <li>• FAQ content and notifications</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
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