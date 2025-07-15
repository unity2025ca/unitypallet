import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Define admin user type that matches what Header component expects
interface AdminUser {
  id: number;
  username: string;
  isAdmin: boolean;
  roleType?: string;
}

interface Session {
  authenticated: boolean;
  user?: AdminUser;
}

export const useAdminAuth = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Check if user is logged in
  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["/api/session"],
  });

  // Login mutation with improved error handling
  const login = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      try {
        console.log("Attempting to login with:", { username });
        const result = await apiRequest("/api/login", { 
          method: "POST", 
          body: JSON.stringify({ username, password }) 
        });
        
        console.log("Login successful:", result);
        return result;
      } catch (error) {
        console.error("Login error:", error);
        
        // Handle specific error types
        if (error instanceof SyntaxError && error.message.includes('DOCTYPE')) {
          throw new Error("Network error: Server returned HTML instead of JSON. Please try again.");
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      // Ensure authentication state is refreshed
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      
      // Use setTimeout to give a moment for the session to be established
      setTimeout(() => {
        console.log("Redirecting after successful login");
        navigate("/admin/dashboard");
      }, 300);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the Admin Dashboard",
      });
    },
    onError: (error: any) => {
      console.error("Login mutation error:", error);
      
      // Handle specific error messages for better UX
      let errorMessage = "Please check your username and password";
      
      if (error?.message?.includes("Network error")) {
        errorMessage = "Network connection problem. Please check your internet connection and try again.";
      } else if (error?.message?.includes("Server returned HTML")) {
        errorMessage = "Connection issue. Please refresh the page and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      console.log("Attempting to logout...");
      const result = await apiRequest("POST", "/api/logout");
      console.log("Logout successful:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Logout successful, clearing cache and redirecting...");
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      queryClient.clear(); // Clear all cache
      navigate("/admin/login");
      toast({
        title: "Successfully logged out",
        description: "You have been logged out of the admin panel",
      });
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error?.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  // Using useEffect for navigation to avoid React state updates during render
  useEffect(() => {
    if (!isLoading && !session?.authenticated && location.startsWith("/admin") && location !== "/admin/login") {
      navigate("/admin/login");
    }
  }, [isLoading, session, location, navigate]);

  return {
    user: session?.user,
    isAdmin: session?.user?.isAdmin || false,
    isPublisher: session?.user?.roleType === 'publisher' || false,
    isAuthenticated: session?.authenticated || false,
    isLoading,
    login,
    logout,
  };
};
