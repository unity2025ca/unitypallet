import { useSettings } from "@/hooks/use-settings";

export default function DynamicStyles() {
  const { getSettingValue } = useSettings();
  
  const primaryColor = getSettingValue("primary_color", "#16a34a");
  const secondaryColor = getSettingValue("secondary_color", "#0f766e");
  const fontFamily = getSettingValue("font_family", "Inter, sans-serif");
  
  const cssStyles = `
    :root {
      --primary: ${primaryColor};
      --primary-darker: ${adjustColor(primaryColor, -15)};
      --primary-lighter: ${adjustColor(primaryColor, 15)};
      --secondary: ${secondaryColor};
      --secondary-darker: ${adjustColor(secondaryColor, -15)};
      --secondary-lighter: ${adjustColor(secondaryColor, 15)};
      --font-family: ${fontFamily};
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
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
  );
}

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