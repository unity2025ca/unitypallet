import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mail, Send, Users, Menu } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define interface for subscriber
interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
  name?: string;
}

// Define form schema
const newsletterFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  fromEmail: z.string().email("Please enter a valid email address"),
  isHtml: z.boolean().default(false),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export default function AdminNewsletter() {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading, isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch all subscribers
  const { data: subscribers = [], isLoading: isLoadingSubscribers } = useQuery<Subscriber[]>({
    queryKey: ["/api/admin/subscribers"],
    enabled: isAuthenticated && isAdmin,
  });

  // Initialize form
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      subject: "",
      content: "",
      fromEmail: "",
      isHtml: false,
    },
  });

  // Define mutation for sending newsletter
  const sendNewsletterMutation = useMutation({
    mutationFn: async (data: NewsletterFormValues) => {
      const res = await apiRequest("POST", "/api/admin/subscribers/email", data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send newsletter");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Newsletter sent successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send newsletter",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: NewsletterFormValues) => {
    setConfirmDialogOpen(false);
    sendNewsletterMutation.mutate(data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
        <div className="flex-1 p-4 md:p-8 md:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated and admin
  if (!isAuthenticated || !isAdmin) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu />
          </Button>
        </div>
        
        <div className="flex items-center mb-6">
          <Mail className="h-8 w-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Email Newsletter</h1>
            <p className="text-gray-500">Send emails to all subscribers</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscriber info card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSubscribers ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{subscribers.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {subscribers.length === 1 
                      ? "1 subscriber will receive your email" 
                      : `${subscribers.length} subscribers will receive your email`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Newsletter form card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Compose Newsletter</CardTitle>
              <CardDescription>
                Create and send an email to all subscribers in your mailing list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(() => setConfirmDialogOpen(true))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          This must be a verified sender in your SendGrid account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Newsletter Subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your newsletter content here..." 
                            className="min-h-[200px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isHtml"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use HTML Content</FormLabel>
                          <FormDescription>
                            Enable this if your content includes HTML formatting
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={subscribers.length === 0 || sendNewsletterMutation.isPending}
                  >
                    {sendNewsletterMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-solid rounded-full border-t-transparent animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Newsletter
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Help card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Effective Newsletters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep your subject line clear and engaging</li>
              <li>Start with the most important information</li>
              <li>Use a conversational tone</li>
              <li>Include a clear call-to-action</li>
              <li>Test your email before sending to all subscribers</li>
              <li>Respect your subscribers' privacy</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Newsletter</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email to {subscribers.length} subscribers. 
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onSubmit(form.getValues())}>
              Yes, send newsletter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}