import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
import { Providers } from "@/components/ui/providers";
import DynamicStyles from "@/components/layout/DynamicStyles";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/home";
import ProductsPage from "@/pages/products";
import ProductDetailsPage from "@/pages/product-details";
import AboutPage from "@/pages/about";
import HowItWorksPage from "@/pages/how-it-works";
import FaqPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import AdminIndex from "@/pages/admin/index";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin/login";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");
  
  return (
    <>
      {!isAdminRoute && <Header />}
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductDetailsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/contact" component={ContactPage} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminIndex} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/settings" component={AdminSettings} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Providers>
          <TooltipProvider>
            <DynamicStyles />
            <Toaster />
            <Router />
          </TooltipProvider>
        </Providers>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
