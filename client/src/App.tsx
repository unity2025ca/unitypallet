// Rebuilding gradually with more components
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/ui/providers";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";

// Simple home page component
function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Unity - Home Page</h1>
      <p className="mb-4">Welcome to Unity. We're rebuilding the application.</p>
      <div className="mt-4">
        <a href="/about" className="text-blue-500 hover:underline">About Page</a>
      </div>
    </div>
  );
}

// Simple about page component
function AboutPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">About Unity</h1>
      <p className="mb-4">This is a simple about page to test routing.</p>
      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  return (
    <>
      <div className="bg-gray-800 text-white p-4">
        Current route: {location}
      </div>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Providers>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </Providers>
    </QueryClientProvider>
  );
}

export default App;
