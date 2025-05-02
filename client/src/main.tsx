import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Providers } from "./components/ui/providers";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
  </Providers>
);
