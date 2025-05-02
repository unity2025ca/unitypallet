import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";

// Helper function to darken or lighten colors
function adjustColor(color: string, percent: number): string {
  if (!color.startsWith('#')) return color;
  
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + percent));
  G = Math.max(0, Math.min(255, G + percent));
  B = Math.max(0, Math.min(255, B + percent));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}

// Function to convert HEX color to HSL for shadcn-ui compatibility
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the # from the beginning
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  
  let h = 0;
  let s = 0;
  let l = 0;
  
  // Calculate hue
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  // Calculate lightness
  l = (cmax + cmin) / 2;
  
  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  // Convert to percentages
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return { h, s, l };
}

export default function DynamicStyles() {
  const { getSettingValue, isLoading } = useSettings();
  const [initialized, setInitialized] = useState(false);
  
  // Use the current saved settings from localStorage as default or fallback to dark red
  const DEFAULT_PRIMARY = "#8B0000"; // Dark red (Gazelle blood)
  const DEFAULT_SECONDARY = "#0f766e";
  
  // Get stored values from localStorage
  const getSavedValue = (key: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? item : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  const [primaryColor, setPrimaryColor] = useState(getSavedValue("primary_color", DEFAULT_PRIMARY));
  const [secondaryColor, setSecondaryColor] = useState(getSavedValue("secondary_color", DEFAULT_SECONDARY));
  const [fontFamily, setFontFamily] = useState(getSavedValue("font_family", "Inter, sans-serif"));
  
  // Update state when settings change
  useEffect(() => {
    if (!isLoading) {
      const newPrimary = getSettingValue("primary_color", DEFAULT_PRIMARY);
      const newSecondary = getSettingValue("secondary_color", DEFAULT_SECONDARY);
      const newFont = getSettingValue("font_family", "Inter, sans-serif");
      
      setPrimaryColor(newPrimary);
      setSecondaryColor(newSecondary);
      setFontFamily(newFont);
      
      // Save to localStorage for next page load
      localStorage.setItem("primary_color", newPrimary);
      localStorage.setItem("secondary_color", newSecondary);
      localStorage.setItem("font_family", newFont);
      
      setInitialized(true);
    }
  }, [getSettingValue, isLoading]);
  
  // Smooth transition once settings are loaded
  useEffect(() => {
    if (initialized) {
      document.documentElement.classList.add('theme-transition-complete');
    }
  }, [initialized]);
  
  const cssStyles = `
    /* Initial transitions disabled to prevent flashing colors */
    :root {
      --primary: ${primaryColor};
      --primary-darker: ${adjustColor(primaryColor, -15)};
      --primary-lighter: ${adjustColor(primaryColor, 15)};
      --secondary: ${secondaryColor};
      --secondary-darker: ${adjustColor(secondaryColor, -15)};
      --secondary-lighter: ${adjustColor(secondaryColor, 15)};
      --font-family: ${fontFamily};
    }
    
    /* Add transition once initialized */
    .theme-transition-complete * {
      transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease !important;
    }
    
    body {
      font-family: var(--font-family);
    }
    
    .text-primary {
      color: var(--primary);
    }
    
    .bg-primary {
      background-color: var(--primary);
    }
    
    .border-primary {
      border-color: var(--primary);
    }
    
    .text-secondary {
      color: var(--secondary);
    }
    
    .bg-secondary {
      background-color: var(--secondary);
    }
    
    .border-secondary {
      border-color: var(--secondary);
    }
    
    /* Button Classes for Red-White-Black Theme */
    .btn-red {
      background: #dc2626 !important;
      border: 1px solid #b91c1c !important;
      color: white !important;
      transition: all 0.3s ease !important;
    }
    
    .btn-red:hover {
      background: #b91c1c !important;
    }
    
    .btn-white {
      background: white !important;
      border: 2px solid #e5e7eb !important;
      color: #111827 !important;
      transition: all 0.3s ease !important;
    }
    
    .btn-white:hover {
      background: #f3f4f6 !important;
    }
    
    .btn-black {
      background: #111827 !important;
      border: 1px solid black !important;
      color: white !important;
      transition: all 0.3s ease !important;
    }
    
    .btn-black:hover {
      background: black !important;
    }
    
    /* Fix button contrast issues */
    .bg-white .btn, 
    button[class*="bg-white"],
    .bg-background .btn,
    button[class*="bg-background"],
    a[href][class*="bg-white"],
    a[href][class*="bg-background"] {
      border: 1px solid #e2e8f0;
      color: #374151 !important;
    }
    
    /* Make ALL outline buttons more visible on white background */
    button[class*="variant-outline"],
    a[class*="variant-outline"],
    .btn-outline,
    [class*="outline"],
    [class*="white"],
    button[data-variant="outline"],
    div[role="button"][data-variant="outline"],
    a[data-variant="outline"] {
      border: 1.5px solid ${primaryColor} !important;
      color: ${primaryColor} !important;
      background: transparent !important;
    }
    
    button[class*="variant-outline"]:hover,
    a[class*="variant-outline"]:hover,
    .btn-outline:hover,
    [class*="outline"]:hover,
    [class*="white"]:hover,
    button[data-variant="outline"]:hover,
    div[role="button"][data-variant="outline"]:hover,
    a[data-variant="outline"]:hover {
      background: ${primaryColor}15 !important;
      border-color: ${primaryColor} !important;
    }
    
    /* Fix white buttons on white background */
    .bg-white,
    .bg-white button,
    button.bg-white,
    .bg-white a[role="button"],
    a[role="button"].bg-white,
    .bg-background button,
    button.bg-background,
    .bg-background a[role="button"],
    a[role="button"].bg-background,
    [data-white-button] {
      border: 1.5px solid ${primaryColor} !important;
      color: ${primaryColor} !important;
    }
    
    /* Ensure primary buttons have readable text */
    .bg-primary, 
    button[class*="bg-primary"],
    a[href][class*="bg-primary"],
    [class*="text-primary-foreground"],
    .text-primary-foreground,
    [data-theme-button] {
      color: white !important;
    }

    /* Force white buttons to be visible */
    button.bg-white,
    button.white,
    a.bg-white,
    a.white,
    div.white[role="button"],
    div.bg-white[role="button"],
    button[class*="white"],
    .white-btn,
    .white-button,
    button[data-white],
    a[data-white] {
      background-color: transparent !important;
      border: 2px solid ${primaryColor} !important;
      color: ${primaryColor} !important;
    }
    
    /* Gray buttons */
    .bg-white button:not([class*="destructive"]):not([class*="outline"]):not([class*="white"]),
    .bg-background button:not([class*="destructive"]):not([class*="outline"]):not([class*="white"]),
    button.bg-default,
    a[role="button"]:not([class*="destructive"]):not([class*="outline"]):not([class*="white"]),
    button[class*="variant-default"],
    button[class*="bg-gray"],
    [data-theme-button],
    .btn {
      background: #4b5563 !important;
      color: white !important;
      border: 1px solid #374151 !important;
      transition: all 0.3s ease !important;
    }
    
    /* Hover effect for buttons */
    .bg-white button:not([class*="destructive"]):not([class*="outline"]):hover,
    .bg-background button:not([class*="destructive"]):not([class*="outline"]):hover,
    button.bg-default:hover,
    a[role="button"]:not([class*="destructive"]):not([class*="outline"]):hover,
    button[class*="variant-default"]:hover,
    button[class*="bg-gray"]:hover,
    [data-theme-button]:hover,
    .btn:hover {
      background: #374151 !important;
    }
    
    /* Override global shadcn colors with our custom primary */
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      --primary-color: ${primaryColor.replace('#', '')};
      --primary-h: ${hexToHSL(primaryColor).h};
      --primary-s: ${hexToHSL(primaryColor).s}%;
      --primary-l: ${hexToHSL(primaryColor).l}%;
      --primary: var(--primary-h) var(--primary-s) var(--primary-l);
      --primary-foreground: ${hexToHSL(primaryColor).l > 60 ? '222.2 47.4% 11.2%' : '210 40% 98%'};
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: var(--primary-h) var(--primary-s) var(--primary-l);
      --radius: 0.5rem;
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
  );
}