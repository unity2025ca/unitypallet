import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Removed Providers wrapper since it's already included in App.tsx
createRoot(document.getElementById("root")!).render(<App />);
