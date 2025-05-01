import { createContext, ReactNode, useContext } from "react";
import { 
  useQuery, 
  useMutation,
  UseMutationResult
} from "@tanstack/react-query";
import { CustomerRegistration, LoginCredentials, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CustomerAuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, CustomerRegistration>;
};

export const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/customer'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/customer/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/customer'], user);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحبًا، ${user.fullName || user.username}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "فشل تسجيل الدخول، يرجى التحقق من اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: CustomerRegistration) => {
      // Validate password match
      if (data.password !== data.confirmPassword) {
        throw new Error("كلمات المرور غير متطابقة");
      }
      
      const res = await apiRequest("POST", "/api/customer/register", data);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/customer'], user);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحبًا بك في موقعنا!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/customer/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/customer'], null);
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريبًا!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <CustomerAuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}