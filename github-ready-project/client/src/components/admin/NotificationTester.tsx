import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Form schema
const formSchema = z.object({
  email: z.string().email("Must be a valid email address").optional(),
  phone: z.string().min(8, "Phone number must be at least 8 characters").optional(),
}).refine((data) => data.email || data.phone, {
  message: "At least one of email or phone is required",
  path: ["email"],
});

type FormValues = z.infer<typeof formSchema>;

// Result type for the API response
interface NotificationTestResult {
  email: {
    tested: boolean;
    success: boolean;
    error: string | null;
  };
  sms: {
    tested: boolean;
    success: boolean;
    error: string | null;
  };
}

export default function NotificationTester() {
  const [testResults, setTestResults] = useState<NotificationTestResult | null>(null);
  
  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });
  
  // Mutation for testing notifications
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/admin/notifications/test-services", data);
      const result = await res.json();
      return result;
    },
    onSuccess: (data) => {
      console.log("Test results:", data);
      if (data.success) {
        toast({
          title: "Test completed",
          description: "Notification test completed. Check results below.",
        });
        setTestResults(data.results);
      } else {
        toast({
          variant: "destructive",
          title: "Test failed",
          description: data.error || "Unknown error occurred during the test",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to run notification test",
      });
    },
  });
  
  function onSubmit(values: FormValues) {
    console.log("Submitting", values);
    setTestResults(null);
    mutate(values);
  }
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
        <CardDescription>
          Send test email and SMS notifications to verify the system is working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="test@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email to send the test notification to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Phone number to send the test SMS to (include country code)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </form>
        </Form>
        
        {testResults && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            {/* Email test results */}
            {testResults.email.tested && (
              <Alert variant={testResults.email.success ? "default" : "destructive"}>
                {testResults.email.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <AlertTitle>Email Test {testResults.email.success ? "Succeeded" : "Failed"}</AlertTitle>
                <AlertDescription>
                  {testResults.email.success 
                    ? "Email was sent successfully. Please check your inbox." 
                    : `Failed to send email: ${testResults.email.error || "Unknown error"}`}
                </AlertDescription>
              </Alert>
            )}
            
            {/* SMS test results */}
            {testResults.sms.tested && (
              <Alert variant={testResults.sms.success ? "default" : "destructive"}>
                {testResults.sms.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <AlertTitle>SMS Test {testResults.sms.success ? "Succeeded" : "Failed"}</AlertTitle>
                <AlertDescription>
                  {testResults.sms.success 
                    ? "SMS was sent successfully. Please check your phone." 
                    : `Failed to send SMS: ${testResults.sms.error || "Unknown error"}`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Having issues with notifications? Check your API credentials and environment settings.
        </p>
      </CardFooter>
    </Card>
  );
}