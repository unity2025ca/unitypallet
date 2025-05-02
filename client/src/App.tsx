// Simplified App component to diagnose import issues
import NotFound from "@/pages/not-found";

function App() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Unity - Diagnostic Mode</h1>
      <p className="mb-4">This is a simplified version of the app to diagnose import issues.</p>
      <NotFound />
    </div>
  );
}

export default App;
