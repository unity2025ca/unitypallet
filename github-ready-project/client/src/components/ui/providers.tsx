import { ReactNode } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
