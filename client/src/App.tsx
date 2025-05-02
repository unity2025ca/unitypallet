// Focused on admin panel rebuild
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/ui/providers";
import NotFound from "@/pages/not-found";
import { useLocation, Link } from "wouter";

// Simple home page component with admin link
function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Unity</h1>
      <p className="mb-4">أهلاً بك في موقع وحدة لبيع منصات أمازون المرتجعة.</p>
      <div className="mt-4">
        <Link href="/admin/login" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          لوحة التحكم
        </Link>
      </div>
    </div>
  );
}

// Simple admin login page
function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول إلى لوحة التحكم</h1>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">اسم المستخدم</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>
          <div>
            <Link href="/admin/dashboard">
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                تسجيل الدخول
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple Admin Dashboard
function AdminDashboardPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="text-xl font-bold mb-6">لوحة التحكم</div>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block py-2 px-4 rounded bg-gray-700">
            الرئيسية
          </Link>
          <Link href="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-700">
            المنتجات
          </Link>
          <Link href="/admin/orders" className="block py-2 px-4 rounded hover:bg-gray-700">
            الطلبات
          </Link>
          <Link href="/" className="block py-2 px-4 rounded hover:bg-gray-700">
            العودة للموقع
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">مرحباً بك في لوحة التحكم</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">المنتجات</h2>
            <p className="text-3xl font-bold">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">الطلبات</h2>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">الزوار</h2>
            <p className="text-3xl font-bold">738</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
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
