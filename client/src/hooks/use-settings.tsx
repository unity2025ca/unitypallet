import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Setting } from "@shared/schema";

type SettingsContextType = {
  settings: Map<string, Setting> | undefined;
  isLoading: boolean;
  error: Error | null;
  getSettingValue: (key: string, defaultValue?: string) => string;
  getSettingsByCategory: (category: string) => Setting[];
  allSettings: Setting[] | undefined;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const {
    data: allSettings,
    error,
    isLoading,
  } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create a map for faster lookups
  const settingsMap = new Map<string, Setting>();
  allSettings?.forEach(setting => {
    settingsMap.set(setting.key, setting);
  });

  const getSettingValue = (key: string, defaultValue = "") => {
    return settingsMap.get(key)?.value || defaultValue;
  };

  const getSettingsByCategory = (category: string) => {
    return allSettings?.filter(setting => setting.category === category) || [];
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: settingsMap,
        isLoading,
        error,
        getSettingValue,
        getSettingsByCategory,
        allSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}