import { Switch, Route } from "wouter";
import { createContext, useContext } from "react";

// Simple emergency interface to get the site working again

// Create basic nav pages as direct components
function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Unity E-commerce Platform</h1>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome to Unity</h2>
        <p className="mb-4">
          Your source for authentic Amazon return pallets at competitive prices.
        </p>
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <p className="text-yellow-800">
            Note: We are experiencing technical difficulties with our website. Some features may be temporarily unavailable.
          </p>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <p className="mb-4">
          At Unity, we strive to provide authentic products at discounted prices through Amazon return pallets to customers in Saudi Arabia. We believe in delivering value and quality simultaneously.
        </p>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg p-6 shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to Admin Panel</h1>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Username</label>
            <input type="text" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Password</label>
            <input type="password" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button 
            type="button" 
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-600">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
    </div>
  );
}

// Simple header
function SimpleHeader() {
  return (
    <header className="bg-black text-white py-4 px-6 shadow-md">
      <div className="flex justify-between items-center">
        <div className="font-bold text-xl">Unity</div>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-red-400">Home</a></li>
            <li><a href="/about" className="hover:text-red-400">About</a></li>
            <li><a href="/admin/login" className="hover:text-red-400">Admin</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Simple footer
function SimpleFooter() {
  return (
    <footer className="bg-gray-100 py-6 px-6 mt-12">
      <div className="text-center text-gray-600">
        &copy; {new Date().getFullYear()} Unity. All rights reserved.
      </div>
    </footer>
  );
}

// Main App component without any complex imports
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SimpleHeader />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      
      <SimpleFooter />
    </div>
  );
}

export default App;
