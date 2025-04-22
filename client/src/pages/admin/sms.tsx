import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Subscriber, Contact } from "@shared/schema";

const AdminSms = () => {
  // Auth check
  const { isAdmin } = useAdminAuth();
  
  // Toast notifications
  const { toast } = useToast();
  
  // State for single SMS
  const [singleSmsData, setSingleSmsData] = useState({
    to: "",
    body: ""
  });
  
  // State for bulk SMS
  const [bulkSmsData, setBulkSmsData] = useState({
    to: "",
    body: ""
  });
  
  // State for subscriber SMS
  const [subscriberSmsData, setSubscriberSmsData] = useState({
    body: ""
  });
  
  // Fetch subscribers
  const { 
    data: subscribers, 
    isLoading: subscribersLoading,
    refetch: refetchSubscribers 
  } = useQuery<Subscriber[]>({
    queryKey: ["/api/admin/subscribers"],
    enabled: isAdmin
  });
  
  // Fetch contacts (for the import feature)
  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: isAdmin
  });
  
  // Get count of subscribers with phone numbers
  const subscribersWithPhone = subscribers?.filter(sub => sub.phone && sub.phone.startsWith('+')) || [];
  
  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/subscribers/import-contacts");
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Import Successful",
          description: data.message,
          variant: "default",
        });
        // Refetch subscribers to update the list
        refetchSubscribers();
      } else {
        toast({
          title: "Import Partial or Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import contacts",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for sending single SMS
  const singleSmsMutation = useMutation({
    mutationFn: async (data: { to: string; body: string }) => {
      const response = await apiRequest("POST", "/api/admin/sms/send", data);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "SMS Sent",
          description: "Message has been sent successfully!",
          variant: "default",
        });
        // Clear form
        setSingleSmsData({ to: "", body: "" });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send SMS",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending the SMS",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for sending bulk SMS
  const bulkSmsMutation = useMutation({
    mutationFn: async (data: { to: string[]; body: string }) => {
      const response = await apiRequest("POST", "/api/admin/sms/bulk", data);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Bulk SMS Sent",
          description: data.message || "Messages have been sent successfully!",
          variant: "default",
        });
        // Clear form
        setBulkSmsData({ to: "", body: "" });
      } else {
        toast({
          title: "Partial Success",
          description: data.message || "Some messages failed to send",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending bulk SMS",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for sending SMS to subscribers
  const subscriberSmsMutation = useMutation({
    mutationFn: async (data: { body: string }) => {
      const response = await apiRequest("POST", "/api/admin/sms/subscribers", data);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "SMS Sent to Subscribers",
          description: data.message || "Messages have been sent to all subscribers!",
          variant: "default",
        });
        // Clear form
        setSubscriberSmsData({ body: "" });
      } else {
        toast({
          title: "Partial Success",
          description: data.message || "Some messages failed to send",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending SMS to subscribers",
        variant: "destructive",
      });
    }
  });
  
  // Handle forms
  const handleSingleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!singleSmsData.to || !singleSmsData.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(singleSmsData.to)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be in international format (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }
    
    singleSmsMutation.mutate({
      to: singleSmsData.to,
      body: singleSmsData.body
    });
  };
  
  const handleBulkSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkSmsData.to || !bulkSmsData.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Parse phone numbers from textarea (one per line)
    const phoneNumbers = bulkSmsData.to
      .split("\n")
      .map(number => number.trim())
      .filter(number => number.length > 0);
    
    if (phoneNumbers.length === 0) {
      toast({
        title: "No Phone Numbers",
        description: "Please enter at least one valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /^\+[0-9]{10,15}$/;
    const invalidNumbers = phoneNumbers.filter(number => !phoneRegex.test(number));
    
    if (invalidNumbers.length > 0) {
      toast({
        title: "Invalid Phone Number(s)",
        description: `${invalidNumbers.length} number(s) are invalid. All numbers must be in international format (e.g., +1234567890)`,
        variant: "destructive",
      });
      return;
    }
    
    bulkSmsMutation.mutate({
      to: phoneNumbers,
      body: bulkSmsData.body
    });
  };
  
  const handleSubscriberSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriberSmsData.body) {
      toast({
        title: "Missing Message",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }
    
    if (subscribersWithPhone.length === 0) {
      toast({
        title: "No Subscribers",
        description: "There are no subscribers with valid phone numbers",
        variant: "destructive",
      });
      return;
    }
    
    subscriberSmsMutation.mutate({
      body: subscriberSmsData.body
    });
  };
  
  // Function to handle input changes for single SMS
  const handleSingleSmsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSingleSmsData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to handle input changes for bulk SMS
  const handleBulkSmsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBulkSmsData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to handle input changes for subscriber SMS
  const handleSubscriberSmsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubscriberSmsData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">SMS Messaging</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          SMS messages are sent using Twilio. Make sure the phone numbers are in international format starting with + (e.g., +1234567890).
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="single">
        <TabsList className="mb-4">
          <TabsTrigger value="single">Single SMS</TabsTrigger>
          <TabsTrigger value="bulk">Bulk SMS</TabsTrigger>
          <TabsTrigger value="subscribers">SMS to Subscribers</TabsTrigger>
        </TabsList>
        
        {/* Single SMS Tab */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Send a Single SMS</CardTitle>
              <CardDescription>
                Send an SMS message to a single recipient.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSingleSmsSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="to" className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="to"
                    name="to"
                    placeholder="+12345678900"
                    value={singleSmsData.to}
                    onChange={handleSingleSmsChange}
                  />
                  <p className="text-sm text-gray-500">
                    Must be in international format (e.g., +1234567890)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="body" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="body"
                    name="body"
                    placeholder="Your message here..."
                    rows={4}
                    value={singleSmsData.body}
                    onChange={handleSingleSmsChange}
                  />
                  <p className="text-sm text-gray-500">
                    {singleSmsData.body.length} characters
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={singleSmsMutation.isPending}
                  className="ml-auto"
                >
                  {singleSmsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send SMS"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Bulk SMS Tab */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk SMS</CardTitle>
              <CardDescription>
                Send the same message to multiple recipients.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleBulkSmsSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="bulkTo" className="block text-sm font-medium">
                    Phone Numbers
                  </label>
                  <Textarea
                    id="bulkTo"
                    name="to"
                    placeholder="+12345678900
+23456789012
+34567890123"
                    rows={5}
                    value={bulkSmsData.to}
                    onChange={handleBulkSmsChange}
                  />
                  <p className="text-sm text-gray-500">
                    Enter one phone number per line in international format (e.g., +1234567890)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bulkBody" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="bulkBody"
                    name="body"
                    placeholder="Your message here..."
                    rows={4}
                    value={bulkSmsData.body}
                    onChange={handleBulkSmsChange}
                  />
                  <p className="text-sm text-gray-500">
                    {bulkSmsData.body.length} characters
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={bulkSmsMutation.isPending}
                  className="ml-auto"
                >
                  {bulkSmsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Bulk SMS"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Subscribers SMS Tab */}
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Send SMS to Subscribers</CardTitle>
              <CardDescription>
                Send a message to all subscribers with phone numbers.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubscriberSmsSubmit}>
              <CardContent className="space-y-4">
                {subscribersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading subscribers...
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {subscribersWithPhone.length > 0 ? (
                          <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                        ) : (
                          <AlertCircle className="text-amber-500 mr-2 h-5 w-5" />
                        )}
                        <span className="font-medium">
                          {subscribersWithPhone.length} subscribers with phone numbers
                        </span>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => importContactsMutation.mutate()}
                        disabled={importContactsMutation.isPending || contactsLoading}
                      >
                        {importContactsMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download mr-2"></i>
                            Import from Contacts
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        {subscribersWithPhone.length > 0 
                          ? `Your message will be sent to ${subscribersWithPhone.length} subscriber(s).`
                          : "There are no subscribers with phone numbers. Import from contacts or add phone numbers to subscriber profiles."}
                      </p>
                      
                      {contacts && contacts.length > 0 && (
                        <p className="text-xs text-gray-500">
                          You have {contacts.length} contact(s) available that may be imported as subscribers.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="subscriberBody" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="subscriberBody"
                    name="body"
                    placeholder="Your message here..."
                    rows={4}
                    value={subscriberSmsData.body}
                    onChange={handleSubscriberSmsChange}
                    disabled={subscribersWithPhone.length === 0}
                  />
                  <p className="text-sm text-gray-500">
                    {subscriberSmsData.body.length} characters
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={subscriberSmsMutation.isPending || subscribersWithPhone.length === 0}
                  className="ml-auto"
                >
                  {subscriberSmsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send to Subscribers"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSms;