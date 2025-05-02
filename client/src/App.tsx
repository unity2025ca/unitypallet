import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/hooks/use-settings";
import { CustomerAuthProvider } from "@/hooks/use-customer-auth";
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
import AuthPage from "@/pages/auth";
import AccountPage from "@/pages/account";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import OrdersPage from "@/pages/orders/index";
import OrderDetailsPage from "@/pages/orders/[id]";
import AdminIndex from "@/pages/admin/index";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin/login";
import AdminNewsletter from "@/pages/admin/newsletter";
import AdminFaqs from "@/pages/admin/faqs";
import AdminSms from "@/pages/admin/sms";
import AdminAppointments from "@/pages/admin/appointments";
import AdminUsers from "@/pages/admin/users";
import AdminVisitorStats from "@/pages/admin/visitor-stats";
import AdminShipping from "@/pages/admin/shipping";
import AdminHomepage from "@/pages/admin/homepage";
import { useLocation } from "wouter";
import AppointmentBubble from "@/components/shared/AppointmentBubble";
import CartBubble from "@/components/shared/CartBubble";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";
import { CustomerProtectedRoute } from "@/lib/customer-protected-route";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");
  
  // Use visitor tracking hook
  useVisitorTracking();
  
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
        <Route path="/auth" component={AuthPage} />
        <Route path="/cart" component={CartPage} />
        
        {/* Customer Protected Routes */}
        <CustomerProtectedRoute path="/account" component={AccountPage} />
        <CustomerProtectedRoute path="/orders" component={OrdersPage} />
        <CustomerProtectedRoute path="/orders/:id" component={OrderDetailsPage} />
        <CustomerProtectedRoute path="/checkout" component={CheckoutPage} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminIndex} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/newsletter" component={AdminNewsletter} />
        <Route path="/admin/sms" component={AdminSms} />
        <Route path="/admin/faqs" component={AdminFaqs} />
        <Route path="/admin/appointments" component={AdminAppointments} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/visitor-stats" component={AdminVisitorStats} />
        <Route path="/admin/shipping" component={AdminShipping} />
        <Route path="/admin/homepage" component={AdminHomepage} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <AppointmentBubble />}
      {!isAdminRoute && <CartBubble />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <CustomerAuthProvider>
          <Providers>
            <TooltipProvider>
              <DynamicStyles />
              <Toaster />
              <Router />
            </TooltipProvider>
          </Providers>
        </CustomerAuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
