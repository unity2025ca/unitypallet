import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Basic error handling for diagnostics
try {
  console.log("Starting React application...");
  createRoot(document.getElementById("root")!).render(<App />);
  console.log("React application mounted successfully");
} catch (error) {
  console.error("Failed to mount React application:", error);
  
  // Display error on screen for easier debugging
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #e11d48;">Error Starting Application</h1>
        <p>There was a problem loading the application. Technical details:</p>
        <pre style="background: #f1f5f9; padding: 1rem; overflow: auto; border-radius: 0.5rem;">${error?.toString()}</pre>
      </div>
    `;
  }
}
