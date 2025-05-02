// Rebuilding gradually with essential components
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";

// Simple home page component
function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Unity - Home Page</h1>
      <p className="mb-4">Welcome to Unity. We're rebuilding the application.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
