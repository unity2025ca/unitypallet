function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unity E-commerce Platform</h1>
        <p className="text-gray-600 mb-4">
          Welcome to Unity, your source for authentic Amazon return pallets at competitive prices.
        </p>
        <ul className="mb-4 list-disc pl-5 text-gray-500">
          <li>Browse available pallets</li>
          <li>Learn about our process</li>
          <li>Contact our team</li>
        </ul>
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-red-500">
            Note: We are currently experiencing technical difficulties. Our team is working to restore full functionality.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
