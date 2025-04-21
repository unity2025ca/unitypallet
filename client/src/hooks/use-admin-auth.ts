import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface Session {
  authenticated: boolean;
  user?: User;
}

export const useAdminAuth = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Check if user is logged in
  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["/api/session"],
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", { username, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      navigate("/admin/dashboard");
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بك في لوحة التحكم",
      });
    },
    onError: (error) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: "يرجى التحقق من اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      navigate("/admin/login");
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
    },
  });

  // Redirect to login if not authenticated and trying to access admin pages
  if (!isLoading && !session?.authenticated && location.startsWith("/admin") && location !== "/admin/login") {
    navigate("/admin/login");
  }

  return {
    user: session?.user,
    isAdmin: session?.user?.isAdmin || false,
    isAuthenticated: session?.authenticated || false,
    isLoading,
    login,
    logout,
  };
};
