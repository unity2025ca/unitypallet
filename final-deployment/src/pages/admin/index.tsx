import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Admin index page - redirects to login or dashboard
const AdminIndex = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  useEffect(() => {
    // Only navigate when loading is complete
    if (!isLoading) {
      setTimeout(() => {
        if (isAuthenticated) {
          navigate("/admin/dashboard");
        } else {
          navigate("/admin/login");
        }
      }, 0);
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
    </div>
  );
};

export default AdminIndex;
