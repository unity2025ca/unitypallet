import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import translations from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAdminAuth();
  const [_, navigate] = useLocation();
  
  // Redirect if already authenticated with proper checks
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is already authenticated, redirecting to dashboard");
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    
    login.mutate({ username, password }, {
      onError: () => {
        setError(translations.admin.login.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {translations.admin.login.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {translations.admin.login.username}
              </Label>
              <Input 
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {translations.admin.login.password}
              </Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full red-gray-gradient text-white" 
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  جارٍ تسجيل الدخول...
                </span>
              ) : (
                translations.admin.login.submit
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
      
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
