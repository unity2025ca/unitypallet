import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  attribute = "data-theme",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    const defaultThemeState = localStorage.getItem(storageKey) as Theme || defaultTheme

    setTheme(defaultThemeState)
    root.setAttribute(attribute, defaultThemeState)
  }, [])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      const root = window.document.documentElement
      root.setAttribute(attribute, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}