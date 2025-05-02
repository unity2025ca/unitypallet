import { Switch, Route } from "wouter";
import { createContext, useContext } from "react";

// Create simple translations object
const translations = {
  navItems: {
    home: "Home",
    shop: "Products",
    about: "About Us",
    howItWorks: "How It Works", 
    faq: "FAQ",
    contact: "Contact Us",
    admin: "Admin"
  }
};

// Create context
const TranslationsContext = createContext(translations);

// Create hook
export const useTranslations = () => useContext(TranslationsContext);

// Create simple home page component
function HomePage() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Unity E-commerce Platform</h1>
      <p className="mb-4">
        Welcome to Unity, your source for authentic Amazon return pallets at competitive prices.
      </p>
      <div className="bg-yellow-50 p-4 rounded border border-yellow-200 my-4">
        <p className="text-yellow-800">
          Note: We are rebuilding our site. Some pages and features are currently unavailable. 
          Please check back soon for the full experience.
        </p>
      </div>
    </div>
  );
}

// Create simple about page
function AboutPage() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <p className="mb-4">
        At Unity, we specialize in providing authentic Amazon return pallets at competitive prices.
      </p>
    </div>
  );
}

// Create simple not found page
function NotFoundPage() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-600">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
    </div>
  );
}

// Create router component
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

// Main App component
function App() {
  return (
    <TranslationsContext.Provider value={translations}>
      <div className="min-h-screen bg-white">
        <header className="bg-black text-white py-4 px-6 shadow-md">
          <div className="flex justify-between items-center">
            <div className="font-bold text-xl">Unity</div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="/" className="hover:text-red-400">Home</a></li>
                <li><a href="/about" className="hover:text-red-400">About</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <main>
          <Router />
        </main>

        <footer className="bg-gray-100 py-6 px-6 mt-12">
          <div className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} Unity. All rights reserved.
          </div>
        </footer>
      </div>
    </TranslationsContext.Provider>
  );
}

export default App;
