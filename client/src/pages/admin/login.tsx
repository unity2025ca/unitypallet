import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAppTranslations } from "@/App"; // Using translations directly from App context
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
  const translations = useAppTranslations(); // Use translations from App context
  
  // Log translations to help debug
  useEffect(() => {
    console.log("Translations loaded:", translations);
  }, [translations]);
  
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
      setError("Please fill in all fields");
      return;
    }
    
    login.mutate({ username, password }, {
      onError: () => {
        setError("Invalid username or password");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Login to Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username
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
                Password
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
              className="w-full gray-button text-white" 
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Logging in...
                </span>
              ) : (
                "Login"
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
